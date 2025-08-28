'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me')
        const data = await res.json()

        if (!data.ok) {
          router.push('/login')
        } else {
          setUser(data.user)
        }
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4">Profil</h1>
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ) : (
          <p>Belum login</p>
        )}
      </div>
    </main>
  )
}
