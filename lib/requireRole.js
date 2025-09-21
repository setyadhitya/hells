import { cookies } from "next/headers"
import { verifyToken } from "./auth"
import { redirect } from "next/navigation"

// 🔒 fungsi helper untuk validasi role
export async function requireRole(allowedRoles = []) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || null
  const user = token ? await verifyToken(token) : null

  if (!user) {
    // Kalau belum login → ke halaman login
    redirect("/regler-admin-pengaturan/login")
  }

  if (!allowedRoles.includes(user.role)) {
    // Kalau role tidak termasuk yang diizinkan
    if (user.role === "praktikan") {
      redirect("/profil")
    } else if (user.role === "admin") {
      redirect("/regler-admin-pengaturan/dashboard")
    } else {
      redirect("/") // fallback
    }
  }

  return user // return user supaya bisa dipakai di halaman
}
