// app/api/csrf/route.js
import { ensureCsrfCookie } from "../../../lib/csrf";

/**
 * Endpoint untuk memberikan CSRF token ke frontend.
 * Saat dipanggil, ia memastikan cookie CSRF tersedia.
 */
export async function GET(req) {
  try {
    // Pastikan token CSRF tersedia
    const { token, setCookie } = await ensureCsrfCookie(req);

    if (!token) {
      return new Response(JSON.stringify({ error: "Gagal membuat CSRF token" }), {
        status: 500,
      });
    }

    // Buat header response
    const headers = { "Content-Type": "application/json" };
    if (setCookie) headers["Set-Cookie"] = setCookie; // jika cookie baru dibuat

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("GET /api/csrf error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
