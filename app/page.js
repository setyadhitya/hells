"use client";   // ⬅️ WAJIB di paling atas!

import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {   // ✅ cukup /api/login
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/dashboard');   // ✅ pakai router.push
    } else {
      setMsg(data.message || 'Login failed');
    }
  }

  return (
    <div className="container">
      <h1>Login - Stern</h1>
      <div className="card">
        <form onSubmit={submit}>
          <div>
            <label>Username</label><br />
            <input value={username} onChange={e=>setUsername(e.target.value)} required />
          </div>
          <div style={{marginTop:10}}>
            <label>Password</label><br />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <div style={{marginTop:12}}>
            <button type="submit">Login</button>
          </div>
          {msg && <p style={{color:'red'}}>{msg}</p>}
        </form>
      </div>
    </div>
  );
}
