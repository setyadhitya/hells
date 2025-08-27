'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token) // simpan token di localStorage
        router.push('/pendaftaran/form')
      } else {
        setError(data.error || 'Login gagal')
      }
    } catch (err) {
      setError('Gagal login, coba lagi')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-gray-700">Login</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />       
         <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Login</button>

        <p className="text-sm text-gray-500 mt-2">
          Belum punya akun?{' '}
          <a href="/pendaftaran/buat_akun" className="text-blue-600 hover:underline">Daftar sekarang</a>
        </p>
      </form>
    </main>
  )
}
