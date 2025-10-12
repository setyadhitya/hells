"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ModulDetail() {
  const { slug } = useParams();
  const router = useRouter();

  const [modul, setModul] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  // ✅ Parsing slug yang lebih aman
  const decodedSlug = decodeURIComponent(slug);
  const match = decodedSlug.match(/(.*?)(?:Pertemuan\s*)(\d+)$/i);

  let mata_kuliah = "";
  let pertemuan = "";

  if (match) {
    mata_kuliah = match[1].trim();
    pertemuan = `Pertemuan ${match[2]}`;
  } else {
    console.warn("⚠️ Slug tidak sesuai format:", decodedSlug);
  }


  const { id } = useParams();

  useEffect(() => {
    fetch(`/api/modul/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setModul(data);
        setPageIndex(0);
      });
  }, [id]);



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

  // Navigasi antar pertemuan (pakai prev_id dan next_id dari API)
  const goToPertemuan = (targetId) => {
    if (!targetId) return; // Jika null, jangan navigasi
    router.push(`/modul/${targetId}`);
  };



  return (
    <div
      className="p-6 max-w-3xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header modul */}
      {modul.materi && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h1 className="text-3xl font-bold mb-2">{modul.mata_kuliah}</h1>
          
          
{/* 🔹 Header modul + navigasi kecil di kanan */}
<div className="flex items-center justify-between mb-3">
<p className="text-gray-600 mb-2">
            Pertemuan {modul.pertemuan} — Materi: {modul.materi}
          </p>
  <div className="flex gap-2">
    {modul.prev_id ? (
      <button
        onClick={() => goToPertemuan(modul.prev_id)}
        className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border text-gray-700"
        title="Pertemuan Sebelumnya"
      >
        ⬅ Prev
      </button>
    ) : (
      <button
        disabled
        className="px-2 py-1 text-sm bg-gray-100 rounded-md border text-gray-400 cursor-not-allowed"
      >
        ⬅ Prev
      </button>
    )}

    {modul.next_id ? (
      <button
        onClick={() => goToPertemuan(modul.next_id)}
        className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border text-gray-700"
        title="Pertemuan Selanjutnya"
      >
        Next ➡
      </button>
    ) : (
      <button
        disabled
        className="px-2 py-1 text-sm bg-gray-100 rounded-md border text-gray-400 cursor-not-allowed"
      >
        Next ➡
      </button>
    )}
  </div>
</div>

        </div>
      )}

      {/* Progress halaman */}
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

      {/* Isi halaman */}
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

      {/* Navigasi antar halaman */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevPage}
          disabled={pageIndex === 0}
          className={`px-4 py-2 rounded-lg border ${pageIndex === 0
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
            }`}
        >
          ⬅ Halaman Sebelumnya
        </button>

        <button
          onClick={nextPage}
          disabled={pageIndex === totalHalaman - 1}
          className={`px-4 py-2 rounded-lg border ${pageIndex === totalHalaman - 1
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
            }`}
        >
          Halaman Selanjutnya ➡
        </button>
      </div>


    </div>
  );
}
