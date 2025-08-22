'use client'
import { useEffect, useState } from 'react'

export default function JadwalPage() {
    const [jadwal, setJadwal] = useState({});

    const shifts = ['I', 'II', 'III', 'IV', 'V'];
    const hariKerja = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    useEffect(() => {
        fetch('/api/jadwal')
            .then(res => res.json())
            .then(data => setJadwal(data))
            .catch(err => console.error('Gagal fetch jadwal:', err));
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Jadwal Praktikum</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <thead className="bg-blue-600 text-white text-lg">
                        <tr>
                            <th className="border p-4">Shift</th>
                            {hariKerja.map((h, i) => (
                                <th key={i} className="border p-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map((shift, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-blue-100"}>
                                <td className="border p-3 font-semibold text-gray-700">{shift}</td>
                                {hariKerja.map((hari, j) => (
                                    <td key={j} className="border p-3 text-gray-800 font-medium">
                                        {jadwal[shift]?.[hari] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
