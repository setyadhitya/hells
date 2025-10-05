"use client"
import Link from "next/link"        // ✅ harus diimport
import { useRouter } from "next/navigation"

export default function DashboardClient({ user }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/../api/auth/logout", {
      method: "POST",
    })
    router.push("/regler-admin-pengaturan/login")
  }

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-700">
        Halo: {user.username} — role: {user.role}
      </p>
    
      <h1 className="text-2xl font-bold">Panduan untuk halaman admin</h1>

    <p className="mt-2 text-gray-700">
        Disini akan diterangkan cara penggunaan halaman admin
      </p>
    </main>
  )
}
