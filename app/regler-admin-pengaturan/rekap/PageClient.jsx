"use client";
import { useEffect, useState } from "react";

export default function PageClient({ initialData }) {
    const [rekap, setRekap] = useState([]); // default array kosong
    const [kodeList, setKodeList] = useState([]);
    const [selectedKode, setSelectedKode] = useState("");

    useEffect(() => {
        // Ambil daftar kode presensi untuk dropdown
        const fetchKode = async () => {
            const res = await fetch("/api/presensi/kode");
            if (res.ok) {
                const data = await res.json();
                setKodeList(data);
            }
        };
        fetchKode();
    }, []);

    const handleFilter = async (kode_id) => {
        setSelectedKode(kode_id);

        let url = "/api/presensi/rekap";
        if (kode_id) url += `?kode_id=${kode_id}`;

        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            setRekap(data);
        }
    };

    return (
        <main className="p-6">
            <h1 className="text-xl font-bold mb-4">Rekap Presensi</h1>

            {/* Dropdown Filter */}
            <div className="mb-4">
                <select
                    value={selectedKode}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">-- Semua Kode --</option>
                    {kodeList.map((k) => (
                        <option key={k.id} value={k.id}>
                            {k.kode} (Pertemuan {k.pertemuan_ke})
                        </option>
                    ))}
                </select>
            </div>

            {/* Tabel Rekap */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Mata Kuliah</th>
                        <th className="border p-2">Kode</th>
                        <th className="border p-2">Nama</th>
                        <th className="border p-2">NIM</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Lokasi</th>
                        <th className="border p-2">Tanggal</th>
                        <th className="border p-2">Asisten</th>
                    </tr>
                </thead>
                <tbody>
                    {rekap.length > 0 ? (
                        rekap.map((r, i) => (
                            <tr key={i} className="text-center">
                                <td className="border p-2">{r.mata_kuliah}</td>
                                <td className="border p-2">{r.kode_presensi}</td>
                                <td className="border p-2">{r.nama}</td>
                                <td className="border p-2">{r.nim}</td>
                                <td className="border p-2">{r.status}</td>
                                <td className="border p-2">{r.lokasi}</td>
                                <td className="border p-2">{new Date(r.tanggal).toLocaleString()}</td>
                                <td className="border p-2">{r.assisten}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center p-4">
                                Tidak ada data presensi
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </main>
    );
}
