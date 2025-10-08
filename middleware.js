import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { logAudit } from "./lib/logger";

const globalLimiter = new RateLimiterMemory({
  points: 240, // 240 requests
  duration: 60, // per menit (global soft limit)
});

export async function middleware(req) {
  const { pathname, origin } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

  // Global rate limit — protect from flood
  try {
    await globalLimiter.consume(ip);
  } catch {
    return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });
  }

  // Build response early so we can set headers
  const res = NextResponse.next();

  // Helmet-like headers + CSP
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // Content Security Policy — sesuaikan jika butuh style/script eksternal
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);

  // Auth check (keep original routes logic)
  const token = req.cookies.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // If token invalid, remove cookie and redirect to login
  if (token && !user) {
    res.cookies.delete("token");
    await logAudit({ userId: null, username: null, action: "invalid_token", ip, userAgent: req.headers.get("user-agent") });
    return NextResponse.redirect(new URL("/regler-admin-pengaturan/login", req.url));
  }

  // replicate your role-based route protections...
  const protectedRoutes = [
    "/regler-admin-pengaturan/dashboard",
    "/regler-admin-pengaturan/rekap",
    "/regler-admin-pengaturan/isimodul",
    "/dashboard",
    "/settings",
    "/profil",
  ];

  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    if (!user) {
      const loginUrl = new URL("/regler-admin-pengaturan/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Other route rules (login redirect, role checks) - same as your prior logic
  if (pathname.startsWith("/regler-admin-pengaturan/login") && user) {
    const redirect = req.nextUrl.searchParams.get("redirect");
    if (redirect) return NextResponse.redirect(new URL(redirect, origin));
    if (user.role === "admin") return NextResponse.redirect(new URL("/regler-admin-pengaturan/dashboard", origin));
    if (user.role === "praktikan") return NextResponse.redirect(new URL("/profil", origin));
    return NextResponse.redirect(new URL("/", origin));
  }

  if (pathname.startsWith("/profil")) {
    if (!user) {
      const loginUrl = new URL("/regler-admin-pengaturan/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "praktikan") return NextResponse.redirect(new URL("/regler-admin-pengaturan/dashboard", origin));
  }

  // Basic referer guard
  const referer = req.headers.get("referer");
  if (referer && !referer.startsWith(origin)) {
    await logAudit({ userId: user?.id || null, username: user?.username || null, action: "referer_mismatch", ip, userAgent: req.headers.get("user-agent") });
    return new Response(JSON.stringify({ error: "Invalid referer" }), { status: 403 });
  }

  // allow
  return res;
}

export const config = {
  matcher: [
    "/regler-admin-pengaturan/:path*",
    "/dashboard/:path*",
    "/profil/:path*",
    "/settings/:path*",
  ],
};
