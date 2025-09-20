"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterClient({ user }) {
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [role,setRole]=useState('user')
  const [msg,setMsg]=useState('')
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    setMsg('')
    const res = await fetch('/../api/auth/register', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username,password,role})
    })
    const data = await res.json()
    if(!res.ok) return setMsg(data?.error || 'Register failed')
    setMsg('Registered. Redirect to dashboard...')
    setTimeout(()=>router.push('/regler-admin-pengaturan/dashboard'),800)
  }

  return (
    <main className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <p className="text-gray-600 mb-2">Logged in as: {user.username} ({user.role})</p>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full p-2 border" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="w-full p-2 border" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button className="px-3 py-2 bg-slate-800 text-white">Register</button>
        {msg && <p className="text-green-600">{msg}</p>}
      </form>
      <div className="mt-4 space-x-4">
        <Link href="/regler-admin-pengaturan/dashboard" className="underline">Dashboard</Link>
      </div>
    </main>
  )
}
