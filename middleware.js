import { NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(req) {
  const token = req.cookies.get("token")?.value
  console.log("DEBUG raw token:", token?.slice(0, 30)) 

  const user = token ? await verifyToken(token) : null
  const { pathname } = req.nextUrl

  console.log("DEBUG middleware pathname:", pathname)
  console.log("DEBUG middleware user.role:", user?.role)

  // Daftar halaman protected jika belum login
  const protectedRoutes = [
    "/regler-admin-pengaturan/dashboard",
    "/regler-admin-pengaturan/rekap",
    "/regler-admin-pengaturan/isimodul",
    "/dashboard",
    "/settings",
    "/profil"
  ]

  // 🔒 Kalau akses halaman protected tapi belum login
  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    if (!user) {
      const loginUrl = new URL("/regler-admin-pengaturan/login", req.url)
      loginUrl.searchParams.set("redirect", pathname) // simpan halaman tujuan
      return NextResponse.redirect(loginUrl)
    }
  }

  // 🔑 Kalau SUDAH login tapi akses halaman login lagi
  if (pathname.startsWith("/regler-admin-pengaturan/login") && user) {
    // Kalau ada query redirect → balikin ke sana
    const redirect = req.nextUrl.searchParams.get("redirect")
    if (redirect) {
      return NextResponse.redirect(new URL(redirect, req.url))
    }

    // Kalau tidak ada → fallback sesuai role
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/regler-admin-pengaturan/dashboard", req.url))
    }

    if (user.role === "praktikan") {
      return NextResponse.redirect(new URL("/profil", req.url))
    }

    return NextResponse.redirect(new URL("/", req.url))
  }

  // 🧑‍🎓 Proteksi halaman khusus praktikan
  if (pathname.startsWith("/profil")) {
    if (!user) {
      const loginUrl = new URL("/regler-admin-pengaturan/login", req.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (user.role !== "praktikan") {
      return NextResponse.redirect(new URL("/regler-admin-pengaturan/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/regler-admin-pengaturan/:path*",
    "/dashboard/:path*",
    "/profil/:path*",
    "/settings/:path*",
  ],
}
