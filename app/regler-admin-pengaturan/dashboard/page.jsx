import { cookies } from "next/headers"
import { verifyToken } from "../../lib/auth"
import DashboardClient from "./DashboardClient"

export default async function Dashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || null
  const user = token ? await verifyToken(token) : null

  if (!user) {
    return (
      <main className="max-w-xl mx-auto py-10">
        <h2 className="text-xl font-bold">Not authenticated</h2>
        <p className="mt-2 text-gray-600">Silakan login kembali.</p>
      </main>
    )
  }

  return <DashboardClient user={user} />
}
