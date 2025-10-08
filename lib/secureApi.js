import { verifyToken } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { verifyCsrf, ensureCsrfCookie } from "@/lib/csrf";
import { logAudit } from "@/lib/logger";
import cookie from "cookie";

// Rate limiter memory default (small scale). Replace with Redis for production.
const rateLimiter = new RateLimiterMemory({
  points: 60, // 60 request
  duration: 60, // per 60 detik
});

export async function secureHandler(req, {
  requireAuth = false,
  rateLimit = false,
  allowedOrigins = ["http://localhost:3000","https://localhost:3000"],
  requireCsrf = false, // jika true => verifikasi CSRF untuk state-changing methods
  handler
}) {
  try {
    const ip =
      headers().get("x-forwarded-for") ||
      headers().get("cf-connecting-ip") ||
      "unknown";

    // Rate limiting per IP
    if (rateLimit) {
      try {
        await rateLimiter.consume(ip);
      } catch {
        return new Response(JSON.stringify({ message: "Terlalu banyak permintaan, coba lagi nanti." }), {
          status: 429,
          headers: { "Retry-After": "60" },
        });
      }
    }

    // Origin/Referer basic check (anti CSRF source)
    const origin = headers().get("origin");
    const referer = headers().get("referer");
    if (origin && !allowedOrigins.some((o) => origin.startsWith(o))) {
      return new Response(JSON.stringify({ message: "Akses tidak diizinkan (Origin mismatch)" }), { status: 403 });
    }
    if (referer && !allowedOrigins.some((o) => referer.startsWith(o))) {
      return new Response(JSON.stringify({ message: "Akses tidak diizinkan (Referer mismatch)" }), { status: 403 });
    }

    // Ensure CSRF cookie exists (double-submit) and verify when required
    // For GET requests we create cookie if missing; for mutating methods we require verification
    const method = req.method?.toUpperCase() || "GET";

    // Prepare response builder so we can set cookie
    const res = new Response(); // placeholder; handler will return final response

    // Ensure CSRF cookie present for all requests (frontend can read it)
    ensureCsrfCookie(req, res);

    if (requireCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (!verifyCsrf(req)) {
        await logAudit({ userId: null, username: null, action: "csrf_failed", ip, userAgent: headers().get("user-agent") || null });
        return new Response(JSON.stringify({ message: "CSRF token invalid" }), { status: 403 });
      }
    }

    // JWT auth if required
    let user = null;
    if (requireAuth) {
      const token = cookies().get("token")?.value;
      user = token ? await verifyToken(token) : null;
      if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
      }
    }

    // Run user's handler and allow it to log audit if needed
    const handlerResp = await handler({ req, user, ip, logAudit });

    // If handler returns a Response, propagate but ensure Set-Cookie from ensureCsrfCookie is present
    // If handlerResp is Response-like, just return it; otherwise serialize
    if (handlerResp instanceof Response) {
      // Attach CSRF Set-Cookie if exist
      const setCookie = res.headers.get("Set-Cookie");
      if (setCookie) handlerResp.headers.set("Set-Cookie", setCookie);
      return handlerResp;
    } else {
      // Build response and attach CSRF cookie if exist
      const final = new Response(JSON.stringify(handlerResp), { status: 200, headers: { "Content-Type": "application/json" } });
      const setCookie = res.headers.get("Set-Cookie");
      if (setCookie) final.headers.set("Set-Cookie", setCookie);
      return final;
    }

  } catch (err) {
    console.error("secureHandler error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
