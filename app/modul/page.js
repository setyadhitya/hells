"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ModulPage() {
  const [modul, setModul] = useState([]);
  const [open, setOpen] = useState({}); // state dropdown

  useEffect(() => {
    fetch("/api/modul")
      .then((res) => res.json())
      .then((data) => setModul(data));
  }, []);

  // group modul berdasarkan mata_kuliah
  const modulGrouped = modul.reduce((acc, cur) => {
    const existing = acc.find((m) => m.mata_kuliah === cur.mata_kuliah);
    if (existing) {
      existing.pertemuan.push(cur.pertemuan);
    } else {
      acc.push({
        mata_kuliah: cur.mata_kuliah,
        pertemuan: [cur.pertemuan],
      });
    }
    return acc;
  }, []);

  // hilangkan duplikasi pertemuan per mata kuliah
  modulGrouped.forEach((matkul) => {
    matkul.pertemuan = [...new Set(matkul.pertemuan)];
  });

  const toggle = (mataKuliah) => {
    setOpen((prev) => ({ ...prev, [mataKuliah]: !prev[mataKuliah] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Daftar Modul
      </h1>

      <div className="space-y-4">
        {modulGrouped.map((matkul) => (
          <div key={matkul.mata_kuliah} className="border rounded-lg overflow-hidden">
            {/* tombol mata kuliah */}
            <button
              className="w-full text-left px-6 py-4 font-semibold text-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => toggle(matkul.mata_kuliah)}
            >
              {matkul.mata_kuliah}
              <span className="float-right">
                {open[matkul.mata_kuliah] ? "▲" : "▼"}
              </span>
            </button>

            {/* daftar pertemuan */}
            <div className={`${open[matkul.mata_kuliah] ? "block" : "hidden"} bg-white`}>
              {matkul.pertemuan.map((p, idx) => (
                <Link
                  key={`${matkul.mata_kuliah}-${p}-${idx}`} // key unik
                  href={`/modul/${p}`}
                  className="block px-8 py-3 border-t hover:bg-gray-50 transition"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
