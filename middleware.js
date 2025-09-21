import { NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"




export async function middleware(req) {
  const token = req.cookies.get("token")?.value
    console.log("DEBUG raw token:", token?.slice(0, 30)) // biar nggak kepanjangan

  const user = token ? await verifyToken(token) : null
  const { pathname } = req.nextUrl

  console.log("DEBUG middleware pathname:", pathname)
console.log("DEBUG middleware user.role:", user?.role)

  // Daftar halaman protected umum
  const protectedRoutes = ["/dashboard", "/settings", "/profil"]

  // 🔒 Kalau akses halaman protected tapi belum login → redirect ke login
  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(new URL("/regler-admin-pengaturan/login", req.url))
    }
  }

  // 🔑 Kalau SUDAH login tapi akses halaman login lagi
  if (pathname.startsWith("/regler-admin-pengaturan/login") && user) {
    // Kalau role = admin → ke dashboard
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/regler-admin-pengaturan/dashboard", req.url))
    }

    // Kalau role = praktikan → ke profil
    if (user.role === "praktikan") {
      return NextResponse.redirect(new URL("/profil", req.url))
    }

    // Fallback kalau ada role lain
    return NextResponse.redirect(new URL("/", req.url))
  }

  // 🧑‍🎓 Proteksi halaman khusus praktikan
  if (pathname.startsWith("/profil")) {
    // Kalau belum login → lempar ke login
    if (!user) {
      return NextResponse.redirect(new URL("/regler-admin-pengaturan/login", req.url))
    }

    // Kalau role BUKAN praktikan → lempar ke dashboard
    if (user.role !== "praktikan") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ✅ Kalau semua aman → lanjut
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/regler-admin-pengaturan/login", // hanya login ini yg dipakai
    "/dashboard/:path*",
    "/profil/:path*",
    "/settings/:path*",
  ],
}
