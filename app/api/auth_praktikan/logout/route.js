import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" })

  // hapus cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/",
  })

  return res
}
