"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ModulPage() {
  const [modul, setModul] = useState([]);
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/modul");
        if (!res.ok) throw new Error("Gagal mengambil data modul");

        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Format data tidak valid");

        setModul(data);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return <p className="p-6 text-gray-600 text-center">Memuat daftar modul...</p>;
  if (error)
    return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (modul.length === 0)
    return <p className="p-6 text-gray-500 text-center">Belum ada modul.</p>;

  // 🔹 Kelompokkan berdasarkan mata kuliah
  const grouped = modul.reduce((acc, cur) => {
    const existing = acc.find((m) => m.mata_kuliah === cur.mata_kuliah);
    if (existing) {
      existing.pertemuan.push({
        id: cur.id,
        nama: cur.pertemuan,
        materi: cur.materi,
      });
    } else {
      acc.push({
        mata_kuliah: cur.mata_kuliah,
        pertemuan: [{ id: cur.id, nama: cur.pertemuan, materi: cur.materi }],
      });
    }
    return acc;
  }, []);

  const toggle = (mataKuliah) => {
    setOpen((prev) => ({ ...prev, [mataKuliah]: !prev[mataKuliah] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        📘 Daftar Modul Praktikum
      </h1>

      <div className="space-y-4">
        {grouped.map((matkul) => (
          <div key={matkul.mata_kuliah} className="border rounded-lg overflow-hidden">
            {/* 🔹 Tombol nama mata kuliah */}
            <button
              className="w-full text-left px-6 py-4 font-semibold text-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => toggle(matkul.mata_kuliah)}
            >
              {matkul.mata_kuliah}
              <span className="float-right">
                {open[matkul.mata_kuliah] ? "▲" : "▼"}
              </span>
            </button>

            {/* 🔹 Daftar pertemuan */}
            <div className={`${open[matkul.mata_kuliah] ? "block" : "hidden"} bg-white`}>
              {matkul.pertemuan.map((p) => (
                <Link
                  key={p.id}
                  href={`/modul/${p.id}`} // 🔸 Langsung pakai ID
                  className="block px-8 py-3 border-t hover:bg-gray-50 transition"
                >
                  <div className="font-medium text-gray-800">{p.nama}</div>
                  {p.materi && (
                    <div className="text-gray-500 text-sm">
                      Materi: {p.materi}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
