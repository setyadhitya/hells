'use client'
import { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode"

export default function ProfilPage() {
  const [userInfo, setUserInfo] = useState({ nim: '', nama: '' })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = jwtDecode(token)
      setUserInfo({
        nim: decoded.nim,
        nama: decoded.nama
      })
    }
  }, [])

  return (
    <main className="min-h-screen p-6 flex justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white shadow p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Profil Praktikan</h1>
        <p><strong>NIM:</strong> {userInfo.nim}</p>
        <p><strong>Nama:</strong> {userInfo.nama}</p>
        <p className="mt-4 text-green-700 font-semibold">✅ Pendaftaran praktikum berhasil!</p>
      </div>
    </main>
  )
}
