"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function PageClient({ user }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    })
    router.push("/")
  }

  // 🔹 Tentukan judul halaman secara dinamis
  let pageTitle = "Halaman"
  if (pathname.startsWith("/dashboard")) {
    pageTitle = "Dashboard"
  } else if (pathname.startsWith("/profil")) {
    pageTitle = "Profil Mahasiswa"
  }

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>
      <p className="mt-2 text-gray-700">
        Halo: {user.username} — role: {user.role}
      </p>
      
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </main>
  )
}
