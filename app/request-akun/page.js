'use client'
import { useState } from 'react'

export default function RequestAkunPage() {
  const [formData, setFormData] = useState({
    NIM: '', Nama: '', Jurusan: '', Email: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/request-akun', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    setMessage(result.message || result.error);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Request Pembuatan Akun</h1>
      {message && <p className={`text-center mb-4 ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        <input type="text" name="NIM" placeholder="NIM" required className="border p-2 rounded" onChange={handleChange}/>
        <input type="text" name="Nama" placeholder="Nama Lengkap" required className="border p-2 rounded" onChange={handleChange}/>
        <input type="text" name="Jurusan" placeholder="Jurusan" required className="border p-2 rounded" onChange={handleChange}/>
        <input type="email" name="Email" placeholder="Email" required className="border p-2 rounded" onChange={handleChange}/>

        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Kirim Request</button>
      </form>
    </main>
  );
}
