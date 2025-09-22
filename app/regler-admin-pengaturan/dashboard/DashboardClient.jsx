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
    <div className="mt-4 space-x-4">
        <Link href="/regler-admin-pengaturan/register" className="underline">Register</Link>
        <Link href="/regler-admin-pengaturan/dashboard" className="underline">Dashboard</Link>
        <Link href="/regler-admin-pengaturan/praktikum" className="underline">Praktikum</Link>
        <Link href="/regler-admin-pengaturan/modul" className="underline">Modul</Link>
        <Link href="/regler-admin-pengaturan/isimodul" className="underline">Isi Modul</Link>
        <Link href="/regler-admin-pengaturan/peminjaman" className="underline">Peminjaman</Link>
        <Link href="/regler-admin-pengaturan/kalender" className="underline">Kalender</Link>
        <Link href="/regler-admin-pengaturan/akun" className="underline">Akun</Link>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </main>
  )
}
