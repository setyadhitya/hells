"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ModulDetail() {
  const { slug } = useParams();
  const [modul, setModul] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/modul/${slug}`)
      .then((res) => res.json())
      .then((data) => setModul(data));
  }, [slug]);

  if (!modul) return <p className="p-6">Loading...</p>;

  const halaman = modul.halaman || [];
  const currentPage = halaman[pageIndex];

  const nextPage = () => {
    if (pageIndex < halaman.length - 1) setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{modul.judul}</h1>
      <p className="text-gray-600 mb-6">{modul.deskripsi}</p>

      {currentPage ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Halaman {currentPage.nomor_halaman}
          </h2>
          <p className="mb-4">{currentPage.isi}</p>

          {currentPage.gambar.map((g) => (
            <div key={g.id} className="mb-4">
              <img
                src={g.path_gambar}
                alt={g.keterangan || "gambar"}
                className="rounded-lg border shadow-sm"
              />
              {g.keterangan && (
                <p className="text-sm text-gray-500 mt-1">{g.keterangan}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Tidak ada halaman tersedia.</p>
      )}

      {/* Navigasi */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevPage}
          disabled={pageIndex === 0}
          className={`px-4 py-2 rounded-lg border ${
            pageIndex === 0
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          ⬅ Prev
        </button>
        <button
          onClick={nextPage}
          disabled={pageIndex === halaman.length - 1}
          className={`px-4 py-2 rounded-lg border ${
            pageIndex === halaman.length - 1
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
