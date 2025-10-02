import { cookies, headers } from "next/headers"
import { verifyToken } from "./auth"
import { redirect } from "next/navigation"

export async function requireRole(allowedRoles = []) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || null
  const user = token ? await verifyToken(token) : null

  if (!user) {
    // Ambil path saat ini pakai await
    const headersList = await headers()
    const currentPath = headersList.get("x-invoke-path") || ""

    redirect(`/regler-admin-pengaturan/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "praktikan") {
      redirect("/profil")
    } else if (user.role === "admin") {
      redirect("/regler-admin-pengaturan/dashboard")
    } else {
      redirect("/") // fallback
    }
  }

  return user
}
