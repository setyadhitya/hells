import { cookies } from "next/headers"
import { verifyToken } from "../../lib/auth"
import RegisterClient from "./RegisterClient" // Client Component
import Link from "next/link"


export default async function RegisterPage() {
const cookieStore = await cookies() // ✅ tambahkan await
  const token = cookieStore.get("token")?.value || null
  const user = token ? await verifyToken(token) : null

  if (!user || user.role !== "admin") {
    return (
      <main className="max-w-xl mx-auto py-10">
        <h2 className="text-xl font-bold">Not authorized</h2>
        <p className="mt-2 text-gray-600">Hanya admin yang dapat mengakses halaman ini.</p>
            <div className="mt-4 space-x-4">
        <Link href="/regler-admin-pengaturan/dashboard" className="underline">Dashboard (protected)</Link>
      </div>
      </main>
    )
  }

  // ✅ kirim props user ke client component
  return <RegisterClient user={user} />
}
