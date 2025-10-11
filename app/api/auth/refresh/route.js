import cookie from "cookie"
import { verifyToken, signToken } from "../../../../lib/auth"

export async function POST(req) {
  const cookieHeader = req.headers.get("cookie") || ""
  const cookiesParsed = cookie.parse(cookieHeader)
  const refresh = cookiesParsed.refreshToken

  if (!refresh) {
    return new Response(JSON.stringify({ error: "no refresh" }), { status: 401 })
  }

  const payload = verifyToken(refresh)
  if (!payload) {
    return new Response(JSON.stringify({ error: "invalid refresh" }), { status: 401 })
  }

  // buat token baru
  const token = signToken({ id: payload.id }, "15m")

  const setCookie = cookie.serialize("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 15,
    path: "/",
  })

  return new Response(
    JSON.stringify({ message: "refreshed" }),
    {
      status: 200,
      headers: { "Set-Cookie": setCookie }
    }
  )
}
