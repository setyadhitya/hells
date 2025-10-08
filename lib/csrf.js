import crypto from "crypto";
import cookie from "cookie";

/**
 * ensureCsrfCookie(req, res)
 * - Jika belum ada cookie `csrf_token`, buat dan set cookie yang bisa diakses JS.
 * - Cookie tidak httpOnly karena frontend harus membaca dan mengirim header.
 */
export function ensureCsrfCookie(req, res) {
  const cookieHeader = req.headers.get("cookie") || "";
  const parsed = cookie.parse(cookieHeader || "");
  if (!parsed.csrf_token) {
    const token = crypto.randomBytes(32).toString("hex");
    const set = cookie.serialize("csrf_token", token, {
      httpOnly: false, // frontend baca
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });
    res.headers.set("Set-Cookie", set);
    return token;
  }
  return parsed.csrf_token;
}

/**
 * verifyCsrf(req)
 * - Periksa header 'x-csrf-token' cocok dengan cookie 'csrf_token'
 * - Kembalikan true/false
 */
export function verifyCsrf(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const parsed = cookie.parse(cookieHeader || "");
  const cookieToken = parsed.csrf_token;
  const headerToken = req.headers.get("x-csrf-token") || req.headers.get("x-xsrf-token") || null;
  if (!cookieToken || !headerToken) return false;
  // compare constant-time
  return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
}
