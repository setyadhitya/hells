// import bawaan Next.js untuk membuat response redirect/next
import { NextResponse } from "next/server";
// import jwt untuk memverifikasi token
import jwt from "jsonwebtoken";

export function middleware(req) {
  // ambil token dari cookie
  const token = req.cookies.get("token")?.value;
  // ambil path yang sedang diakses user
  const { pathname } = req.nextUrl;

  // ================================
  // 1. CEK KALAU SUDAH LOGIN & COBA AKSES /login
  // ================================
  if (token && pathname.startsWith("/regler-admin-pengaturan/login")) {
    try {
      // pastikan token valid
      jwt.verify(token, process.env.JWT_SECRET || "RAHASIA_JWT");
      // kalau valid → redirect ke dashboard
      return NextResponse.redirect(
        new URL("/regler-admin-pengaturan/dashboard", req.url)
      );
    } catch {
      // kalau token invalid → biarin aja lanjut ke login
      return NextResponse.next();
    }
  }

  // ================================
  // 2. CEK KALAU BELUM LOGIN
  // ================================
  if (!token && !pathname.startsWith("/regler-admin-pengaturan/login")) {
    // user belum login tapi mau akses dashboard/halaman lain
    // tendang balik ke login
    return NextResponse.redirect(
      new URL("/regler-admin-pengaturan/login", req.url)
    );
  }

  // ================================
  // 3. CEK TOKEN VALID
  // ================================
  if (token) {
    try {
      // token valid → lanjutkan ke halaman
      jwt.verify(token, process.env.JWT_SECRET || "RAHASIA_JWT");
      return NextResponse.next();
    } catch {
      // token invalid/expired → redirect ke login
      return NextResponse.redirect(
        new URL("/regler-admin-pengaturan/login", req.url)
      );
    }
  }

  // ================================
  // 4. DEFAULT: lanjutkan
  // ================================
  return NextResponse.next();
}

// Middleware hanya akan aktif di route-folder ini
export const config = {
  matcher: ["/regler-admin-pengaturan/:path*"],
};
