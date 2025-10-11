import { verifyToken } from "../lib/auth";
import { headers as nextHeaders, cookies as nextCookies } from "next/headers";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { verifyCsrf, ensureCsrfCookie } from "../lib/csrf";
import { logAudit } from "../lib/logger";
import * as cookie from "cookie";

const rateLimiter = new RateLimiterMemory({
  points: 60, // maksimal 60 request
  duration: 60, // per 60 detik
});

export async function secureHandler(
  req,
  {
    requireAuth = false,
    rateLimit = false,
    allowedOrigins = ["http://localhost:3000", "https://localhost:3000"],
    requireCsrf = false,
    handler,
  }
) {
  try {
    console.log("🟡 secureHandler start, requireAuth:", requireAuth);

    const hdrs = await nextHeaders();
    const cks = await nextCookies();

    const ip =
      hdrs.get("x-forwarded-for") ||
      hdrs.get("cf-connecting-ip") ||
      "unknown";

    // 🛑 Rate limit
    if (rateLimit) {
      try {
        await rateLimiter.consume(ip);
      } catch {
        return new Response(
          JSON.stringify({ message: "Terlalu banyak permintaan, coba lagi nanti." }),
          {
            status: 429,
            headers: { "Retry-After": "60" },
          }
        );
      }
    }

    // 🔒 Origin & Referer check
    const origin = hdrs.get("origin");
    const referer = hdrs.get("referer");

    if (origin && !allowedOrigins.some((o) => origin.startsWith(o))) {
      return new Response(
        JSON.stringify({ message: "Akses tidak diizinkan (Origin mismatch)" }),
        { status: 403 }
      );
    }

    if (referer && !allowedOrigins.some((o) => referer.startsWith(o))) {
      return new Response(
        JSON.stringify({ message: "Akses tidak diizinkan (Referer mismatch)" }),
        { status: 403 }
      );
    }

    const method = req.method?.toUpperCase() || "GET";

    // 🧿 Pastikan cookie CSRF tersedia
    const { token: csrfToken, setCookie } = await ensureCsrfCookie(req);

    // Jika butuh verifikasi CSRF
    if (requireCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const valid = await verifyCsrf(req);
      if (!valid) {
        await logAudit({
          userId: null,
          username: null,
          action: "csrf_failed",
          ip,
          userAgent: hdrs.get("user-agent") || null,
        });
        return new Response(JSON.stringify({ message: "CSRF token invalid" }), {
          status: 403,
        });
      }
    }

    // 🔑 JWT Auth
    let user = null;
    if (requireAuth) {
      const token = cks.get("token")?.value;
      user = token ? await verifyToken(token) : null;
      if (!user) {
        return new Response(
          JSON.stringify({ message: "Unauthorized" }),
          { status: 401 }
        );
      }
    }

    // 🚀 Jalankan handler API
    const handlerResp = await handler({ req, user, ip, logAudit });

    // 🧩 Gabungkan hasil handler dengan Set-Cookie CSRF (jika ada)
    const headers = { "Content-Type": "application/json" };
    if (setCookie) headers["Set-Cookie"] = setCookie;

    if (handlerResp instanceof Response) {
      if (setCookie) handlerResp.headers.set("Set-Cookie", setCookie);
      return handlerResp;
    } else {
      return new Response(JSON.stringify(handlerResp), {
        status: 200,
        headers,
      });
    }
  } catch (err) {
    console.error("secureHandler error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
