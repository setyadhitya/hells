'use client'
import { useEffect, useState } from 'react'

export default function JadwalPage() {
    const [jadwal, setJadwal] = useState([])


    // Ambil data dari API saat komponen dimuat
    useEffect(() => {
        fetch('/api/jadwal')
            .then(res => res.json())
            .then(data => setJadwal(data))
            .catch(err => console.error('Gagal fetch jadwal:', err))
    }, [])



    return (
        <main className="min-h-screen bg-white p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Jadwal Praktikum</h1>
            <table className="w-full text-left border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">Hari, Tanggal, Jam</th>
                        <th className="border p-2">Shift</th>
                        <th className="border p-2">Mata Kuliah</th>
                        <th className="border p-2">Jurusan</th>
                        <th className="border p-2">Assisten</th>
                        <th className="border p-2">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    {jadwal.map((item, i) => (
                        <tr key={i} className="even:bg-gray-50">
                            <td className="border p-2">{item.Hari + ', '+ item.Tanggal + ' '+ item.Jam_Mulai + ' - ' + item.Jam_Ahir}</td>
                            <td className="border p-2">{item.Shift}</td>
                            <td className="border p-2">{item.Mata_Kuliah}</td>
                            <td className="border p-2">{item.Jurusan}</td>
                            <td className="border p-2">{item.Assisten}</td>
                            <td className="border p-2">{item.Catatan}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
