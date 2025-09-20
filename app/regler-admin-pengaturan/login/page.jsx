"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
          credentials: "include",   // ⬅️ ini penting supaya cookie "token" tersimpan
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("Login berhasil, redirect ke dashboard...")
        // simpan token ke localStorage (opsional)
        localStorage.setItem("token", data.token)
        // kasih delay biar pesan sempat muncul
        setTimeout(() => {
          router.push("/regler-admin-pengaturan/dashboard")
        }, 1000)
      } else {
        setMessage(data.error || "Login gagal")
      }
    } catch (err) {
      setMessage("Terjadi kesalahan")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
        <h1 className="mb-4 text-xl">Login</h1>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Login
        </button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </form>
    </div>
  )
}
