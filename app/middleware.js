import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  // Izinkan akses ke login dan register
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/pendaftaran/request-akun')) {
    return NextResponse.next();
  }

  if (!token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    jwt.verify(token, 'RAHASIA_JWT'); // ganti sesuai secret key
    return NextResponse.next();
  } catch (err) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

// Terapkan middleware ke path tertentu
export const config = {
  matcher: ['/pendaftaran/form']
};
