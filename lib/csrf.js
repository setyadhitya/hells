import crypto from "crypto";
import * as cookie from "cookie";

/**
 * Membuat dan mengembalikan header "Set-Cookie" untuk token CSRF.
 * Ini digunakan di secureHandler agar response bisa menambahkan cookie.
 */
export async function ensureCsrfCookie(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const parsed = cookie.parse(cookieHeader || "");

    // Jika sudah ada token CSRF di cookie, kembalikan token itu
    if (parsed.csrf_token) {
      return { token: parsed.csrf_token, setCookie: null };
    }

    // Jika belum ada token, buat token baru
    const token = crypto.randomBytes(32).toString("hex");
    const setCookie = cookie.serialize("csrf_token", token, {
      httpOnly: false, // frontend boleh akses
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return { token, setCookie };
  } catch (err) {
    console.error("ensureCsrfCookie error:", err);
    return { token: null, setCookie: null };
  }
}

/**
 * Verifikasi token CSRF dari cookie dan header.
 */
export async function verifyCsrf(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const parsed = cookie.parse(cookieHeader || "");
    const cookieToken = parsed.csrf_token;
    const headerToken =
      req.headers.get("x-csrf-token") ||
      req.headers.get("x-xsrf-token") ||
      null;

    if (!cookieToken || !headerToken) return false;

    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch (err) {
    console.error("verifyCsrf error:", err);
    return false;
  }
}
