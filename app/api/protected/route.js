import { cookies } from "next/headers"
import { verifyToken } from "../../../lib/auth"

export async function GET(req) { // bisa juga POST atau method lain sesuai kebutuhan
  const cookieStore = cookies() // server-side
  const token = cookieStore.get("token")?.value || null

  const user = token ? verifyToken(token) : null
  if (!user) {
    return new Response(JSON.stringify({ error: "unauth" }), { status: 401 })
  }

  return new Response(
    JSON.stringify({ message: "secret data", user }),
    { status: 200 }
  )
}
