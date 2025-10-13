// Import modul bawaan Next.js untuk membuat response (respon middleware)
import { NextResponse } from "next/server";
// Import fungsi untuk verifikasi token JWT (autentikasi user)
import { verifyToken } from "./lib/auth";
// Import rate limiter untuk mencegah spam request
import { RateLimiterMemory } from "rate-limiter-flexible";
// Import logger untuk mencatat aktivitas penting (audit log)
import { logAudit } from "./lib/logger";

// Membuat rate limiter global: maksimal 100 request per menit per IP (mencegah bruteforce)
const globalLimiter = new RateLimiterMemory({
  points: 100, // jumlah maksimal request
  duration: 60, // dalam detik (60 detik = 1 menit)
});

export async function middleware(req) {
  // Ambil path (misalnya "/dashboard") dan origin (misalnya "https://localhost:3000")
  const { pathname, origin } = req.nextUrl;

  // Ambil alamat IP pengguna dari header (bisa dari proxy / Cloudflare)
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  // 🔒 Batasi request dari 1 IP agar tidak melakukan spam/flooding
  try {
    await globalLimiter.consume(ip);
  } catch {
    // Jika melebihi batas request → kirim respons 429 (Too Many Requests)
    return new Response(JSON.stringify({ message: "Too many requests" }), {
      status: 429,
    });
  }

  // Buat response awal agar bisa ditambahkan header keamanan
  const res = NextResponse.next();

  // 🛡️ Tambahkan header keamanan mirip library Helmet
  res.headers.set("X-Frame-Options", "DENY"); // Cegah halaman dibuka lewat iframe
  res.headers.set("X-Content-Type-Options", "nosniff"); // Cegah MIME type sniffing
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); // Batasi info referrer
  res.headers.set(
    "Permissions-Policy",
    "geolocation=(self), microphone=(), camera=()" // Batasi izin API browser
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload" // Paksa HTTPS selama 2 tahun
  );

  // 🧱 Content Security Policy (CSP): Batasi sumber konten eksternal
  const csp = [
    "default-src 'self'", // Semua sumber default hanya dari domain sendiri
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Izinkan script inline & eval (perlu jika pakai Next dev mode)
    "style-src 'self' 'unsafe-inline'", // Izinkan style inline
    "img-src 'self' data: blob: https:", // Gambar bisa dari local, data URI, blob, dan https
    "font-src 'self' data:", // Font hanya dari self/data
    "object-src 'none'", // Tidak izinkan <object>, <embed>, <applet>
    "frame-ancestors 'none'", // Tidak bisa di-embed di iframe luar
    "base-uri 'self'", // Batasi base URI agar aman
    "form-action 'self'", // Form hanya boleh kirim ke domain sendiri
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);

  // 🔑 Cek autentikasi user
  const token = req.cookies.get("token")?.value || null; // Ambil token dari cookie
  const user = token ? await verifyToken(token) : null; // Verifikasi token JWT

  // Jika token tidak valid → hapus cookie dan arahkan ke halaman login
  if (token && !user) {
    res.cookies.delete("token");
    await logAudit({
      userId: null,
      username: null,
      action: "invalid_token",
      ip,
      userAgent: req.headers.get("user-agent"),
    });
    return NextResponse.redirect(
      new URL("/regler-admin-pengaturan/login", req.url)
    );
  }

  // 🧭 Daftar route yang butuh login
  const protectedRoutes = [
    "/regler-admin-pengaturan/akun",
    "/regler-admin-pengaturan/approve",
    "/regler-admin-pengaturan/assisten",
    "/regler-admin-pengaturan/assisten-prktikum",
    "/regler-admin-pengaturan/dashboard",
    "/regler-admin-pengaturan/halaman",
    "/regler-admin-pengaturan/isimodul",
    "/regler-admin-pengaturan/modul",
    "/regler-admin-pengaturan/peserta_kuliah",
    "/regler-admin-pengaturan/praktikan",
    "/regler-admin-pengaturan/praktikum",
    "/regler-admin-pengaturan/rekap",
  ];

  // Jika user belum login dan mencoba akses route yang dilindungi → redirect ke login
  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    if (!user) {
      const loginUrl = new URL("/regler-admin-pengaturan/login", origin);
      loginUrl.searchParams.set("redirect", pathname); // simpan tujuan agar bisa diarahkan setelah login
      return NextResponse.redirect(loginUrl);
    }
  }

  // 🔄 Jika user sudah login dan membuka halaman login lagi → arahkan ke halaman sesuai role
  if (pathname.startsWith("/regler-admin-pengaturan/login") && user) {
    const redirect = req.nextUrl.searchParams.get("redirect");
    if (redirect) return NextResponse.redirect(new URL(redirect, origin));
    if (user.role === "admin")
      return NextResponse.redirect(
        new URL("/regler-admin-pengaturan/dashboard", origin)
      );
    if (user.role === "praktikan")
      return NextResponse.redirect(new URL("/akun_praktikan", origin));
    return NextResponse.redirect(new URL("/", origin));
  }

  // 👤 Proteksi halaman profil agar hanya bisa diakses oleh user role "praktikan"
  if (pathname.startsWith("/akun_praktikan")) {
    // Jika belum login → arahkan ke login praktikan
    if (!user) {
      const loginUrl = new URL("/login_praktikan", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika user sudah login tetapi bukan "praktikan"
    if (user.role !== "praktikan") {
      // Buat URL tujuan ke halaman utama
      const homeUrl = new URL("/", origin);
      // Tambahkan pesan peringatan ke query string agar bisa ditangkap di halaman frontend
      homeUrl.searchParams.set(
        "alert",
        "Anda sudah login. Hanya praktikan yang boleh mengakses halaman ini. Silakan logout terlebih dahulu untuk masuk sebagai praktikan."
      );
      return NextResponse.redirect(homeUrl);
    }
  }

  // 👤 Proteksi halaman akun assisten agar hanya bisa diakses oleh user role "assisten"
  if (pathname.startsWith("/akun_assisten")) {
    // Jika user belum login, arahkan ke login khusus assisten
    if (!user) {
      const loginUrl = new URL("/login_assisten", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika user sudah login tetapi bukan "assisten"
    if (user.role !== "assisten") {
      // Buat URL tujuan ke halaman utama
      const homeUrl = new URL("/", origin);
      // Tambahkan pesan peringatan agar ditampilkan di halaman utama
      homeUrl.searchParams.set(
        "alert",
        "Anda sudah login. Hanya assisten yang boleh mengakses halaman ini. Silakan logout terlebih dahulu untuk masuk sebagai assisten."
      );
      return NextResponse.redirect(homeUrl);
    }
  }

  // 🔍 Cek referer (keamanan dasar untuk mencegah CSRF sederhana)
  const referer = req.headers.get("referer");
  if (referer && !referer.startsWith(origin)) {
    await logAudit({
      userId: user?.id || null,
      username: user?.username || null,
      action: "referer_mismatch",
      ip,
      userAgent: req.headers.get("user-agent"),
    });
    return new Response(JSON.stringify({ error: "Invalid referer" }), {
      status: 403,
    });
  }

  // Jika semua lolos → lanjutkan request
  return res;
}

// ⚙️ Middleware ini hanya akan dijalankan di route yang cocok dengan pola di bawah
export const config = {
  matcher: [
    "/regler-admin-pengaturan/:path*",
    "/dashboard/:path*",
    "/akun_praktikan/:path*",
    "/akun_assisten/:path*",
  ],
};
