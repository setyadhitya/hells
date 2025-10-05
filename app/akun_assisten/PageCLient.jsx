"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"        // ✅ harus diimport

export default function PageClient({ user }) {
  const router = useRouter()
  const [assisten, setAssisten] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ambil data assisten dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/assisten")
        if (res.ok) {
          const data = await res.json()
          setAssisten(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth_assisten/logout", { method: "POST" })
    router.push("/")
  }

  if (loading) return <p className="text-center py-10">Loading...</p>
  if (!assisten) return <p className="text-center py-10 text-red-600">Data assisten tidak ditemukan</p>

  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      {/* Header Profil */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Halaman Assisten</h1>
        <p className="mt-2 text-gray-600">Halo, {assisten.nama} ({assisten.username})</p>
        <p className="text-gray-500 text-sm">NIM: {assisten.nim} | No. HP: {assisten.nomorhp}</p>
        <p className={`mt-2 font-semibold ${assisten.status === "aktif" ? "text-green-600" : "text-red-600"}`}>
          Status: {assisten.status}
        </p>
      </div>

      {/* Menu hanya jika status aktif */}
      {assisten.status === "aktif" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/kode_presensi"
            className="p-4 bg-blue-100 rounded-xl shadow hover:bg-blue-200 transition block text-center"
          >
            Buat Kode Presensi
          </Link>
          <button className="p-4 bg-yellow-100 rounded-xl shadow hover:bg-yellow-200 transition">
            Kumpulkan Tugas
          </button>
          <button className="p-4 bg-green-100 rounded-xl shadow hover:bg-green-200 transition">
            Aktivitas
          </button>
          <button className="p-4 bg-purple-100 rounded-xl shadow hover:bg-purple-200 transition">
            Pengumuman
          </button>
          <Link
            href="/akun_assisten/akun"
            className="p-4 bg-orange-100 rounded-xl shadow hover:bg-orange-200 transition block text-center"
          >
            Akun
          </Link>
          <button
            onClick={handleLogout}
            className="p-4 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-center text-red-600 font-semibold">
          Akun belum aktif. Silakan hubungi admin/laboran.
        </div>
      )}
    </main>
  )
}
