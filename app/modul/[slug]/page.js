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
      .then((data) => {
        setModul(data);
        setPageIndex(0);
      });
  }, [slug]);

  const halaman = modul?.halaman || [];
  const totalHalaman = halaman.length;
  const currentPage =
    pageIndex >= 0 && pageIndex < totalHalaman ? halaman[pageIndex] : null;

  const nextPage = useCallback(() => {
    if (pageIndex < totalHalaman - 1) setPageIndex((i) => i + 1);
  }, [pageIndex, totalHalaman]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) setPageIndex((i) => i - 1);
  }, [pageIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextPage, prevPage]);

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50) nextPage();
    else if (diff < -50) prevPage();
    setTouchStart(null);
  };

  if (!modul) return <p className="p-6">Loading...</p>;

  const currentNomor = pageIndex + 1;
  const progress =
    totalHalaman > 0 ? ((currentNomor / totalHalaman) * 100).toFixed(0) : 0;

  return (
    <div
      className="p-6 max-w-3xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* materi */}
      {modul.materi && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h1 className="text-3xl font-bold mb-2">{modul.mata_kuliah}</h1>
          <p className="text-gray-600 mb-2">
            {modul.pertemuan} Materi : {modul.materi}
          </p>
        </div>
      )}

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

      {/* isi halaman */}
      {currentPage ? (
        <div className="mb-6">
          <p className="mb-4">Halaman {currentPage.nomor}</p>
          {currentPage.gambar && (
            <div className="mb-4 flex justify-center">
              <img
                src={currentPage.gambar}
                alt={`Gambar halaman ${currentNomor}`}
                className="rounded-lg border shadow-sm w-full max-w-[600px] h-auto object-contain"
              />
            </div>
          )}
          {currentPage.deskripsi && (
            <p className="text-gray-700">{currentPage.deskripsi}</p>
          )}
        </div>
      ) : (
        <p>Tidak ada halaman tersedia.</p>
      )}

      {/* navigasi */}
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
