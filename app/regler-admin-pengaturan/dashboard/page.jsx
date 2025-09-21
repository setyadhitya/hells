import DashboardClient from "./DashboardClient"
import { requireRole } from "../../../lib/requireRole"


export default async function Dashboard() {
  const user = await requireRole(["admin"]) // hanya admin yang boleh masuk berasal dari lib/requireRole


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
