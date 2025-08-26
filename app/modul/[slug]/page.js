"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

export default function ModulDetail() {
  const { slug } = useParams();
  const [modul, setModul] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    fetch(`/api/modul/${slug}`)
      .then((res) => res.json())
      .then((data) => setModul(data));
  }, [slug]);

  const halaman = modul?.halaman || [];
  const currentPage = halaman[pageIndex];

  // fungsi pindah halaman
  const nextPage = useCallback(() => {
    if (pageIndex < halaman.length - 1) setPageIndex((i) => i + 1);
  }, [pageIndex, halaman.length]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) setPageIndex((i) => i - 1);
  }, [pageIndex]);

  // handle keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextPage, prevPage]);

  // handle swipe (mobile)
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // swipe kiri -> next
      nextPage();
    } else if (diff < -50) {
      // swipe kanan -> prev
      prevPage();
    }
    setTouchStart(null);
  };

  if (!modul) return <p className="p-6">Loading...</p>;

  const totalHalaman = halaman.length;
  const currentNomor = pageIndex + 1;
  const progress = totalHalaman > 0 ? ((currentNomor / totalHalaman) * 100).toFixed(0) : 0;

  return (
    <div
      className="p-6 max-w-3xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h1 className="text-3xl font-bold mb-2">{modul.judul}</h1>
      <p className="text-gray-600 mb-6">{modul.deskripsi}</p>

      {/* indikator halaman */}
      {totalHalaman > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1 text-center">
            Halaman {currentNomor} dari {totalHalaman}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

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
          disabled={pageIndex === totalHalaman - 1}
          className={`px-4 py-2 rounded-lg border ${
            pageIndex === totalHalaman - 1
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
