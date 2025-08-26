"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ModulPage() {
  const [modul, setModul] = useState([]);

  useEffect(() => {
    fetch("/api/modul")
      .then((res) => res.json())
      .then((data) => setModul(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Daftar Modul</h1>
      <div className="grid gap-4">
        {modul.map((m) => (
          <Link
            key={m.id}
            href={`/modul/${m.id}`}
            className="block border p-4 rounded-lg hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">{m.judul}</h2>
            <p className="text-gray-600">{m.deskripsi}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
