import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logout berhasil" });
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0, // hapus cookie segera
  });
  return res;
}
