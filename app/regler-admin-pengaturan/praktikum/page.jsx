import { cookies } from "next/headers"
import { verifyToken } from "../../lib/auth"
import PraktikumClient from "./PraktikumClient" // sesuaikan nama komponen klien
import Link from "next/link"

export default async function Praktikum() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || null
  const user = token ? await verifyToken(token) : null

  if (!user) {
    return (
      <main className="max-w-xl mx-auto py-10">
        <h2 className="text-xl font-bold">Not authenticated</h2>
        <p className="mt-2 text-gray-600">Silakan login kembali.</p>
        <div className="mt-4 space-x-4">
          <Link href="/regler-admin-pengaturan/login" className="underline">Login</Link>
        </div>
      </main>
    )
  }

  return <PraktikumClient user={user} />
}
