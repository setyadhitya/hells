import { NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(req) {
  const token = req.cookies.get("token")?.value
  const user = token ? await verifyToken(token) : null

  const { pathname } = req.nextUrl

  // Daftar halaman protected
  const protectedRoutes = ["/dashboard", "/profile", "/settings"]

  // Kalau akses halaman protected tapi belum login → redirect ke /login
  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Kalau sudah login tapi akses /login → redirect ke /dashboard
  if (pathname.startsWith("/login") && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
}
