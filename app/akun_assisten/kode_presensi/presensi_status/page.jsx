"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PresensiStatusPage() {
  const router = useRouter();
  const [statusData, setStatusData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [pesan, setPesan] = useState("");

  // 🔹 Ambil status kode
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/kode_presensi/presensi_status", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);

        // Hitung waktu tersisa (5 menit)
        if (data.status === "aktif") {
          const sisaDetik = Math.max(0, Math.floor((5 - data.selisihMenit) * 60));
          setCountdown(sisaDetik);
        }
      } else {
        setPesan("Belum ada kode presensi aktif.");
      }
    };
    fetchData();
  }, []);

  // 🔹 Jalankan countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setPesan("⏰ Kode presensi telah habis!");
      fetch("/api/kode_presensi/expire", { method: "POST", credentials: "include" });
      setTimeout(() => router.push("/akun_assisten"), 3000);
      return;
    }

    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  const formatCountdown = (detik) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = countdown ? (countdown / (5 * 60)) * 100 : 0;

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">🕒 Status Kode Presensi</h1>

      {statusData ? (
        <div className="p-5 bg-white rounded-2xl shadow-md border">
          <p className="font-semibold text-gray-800">
            Mata Kuliah: <span className="text-blue-600">{statusData.mata_kuliah}</span>
          </p>
          <p className="text-gray-700">
            Pertemuan: {statusData.pertemuan_ke} | Materi: {statusData.materi}
          </p>

          <div className="bg-blue-50 p-4 rounded-xl my-3 text-center">
            <p className="text-lg font-bold text-blue-700">
              Kode Presensi: <span className="text-2xl">{statusData.kode}</span>
            </p>
            <p
              className={`font-semibold ${
                statusData.status === "aktif" ? "text-green-600" : "text-gray-500"
              }`}
            >
              Status: {statusData.status.toUpperCase()}
            </p>

            {/* ✅ Tambahan baru: tampilkan lokasi dan bisa diklik buka Google Maps */}
            {statusData.lokasi && (
              <p className="text-green-600 font-medium mt-1">
                Lokasi kode dibuat:{" "}
                <a
                  href={`https://www.google.com/maps?q=${statusData.lokasi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-800 transition"
                  title="Klik untuk membuka di Google Maps"
                >
                  {statusData.lokasi}
                </a>
              </p>
            )}
          </div>

          {statusData.status === "aktif" && countdown > 0 && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Waktu tersisa</p>
              <p className="text-3xl font-mono font-bold text-red-600">
                {formatCountdown(countdown)}
              </p>
              <div className="w-full bg-gray-200 h-3 rounded-full mt-2">
                <div
                  className="h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-700 space-y-1 border-t pt-3">
            <p className="font-semibold">⚠️ Perhatian:</p>
            <ul className="list-decimal ml-5 space-y-1">
              <li>Gunakan kode ini hanya untuk praktikan yang berhak.</li>
              <li>Lakukan presensi sebelum waktu habis!</li>
              <li>Login ke akun praktikan dan buka menu “Presensi”.</li>
              <li>Aktifkan lokasi di browser sebelum input kode.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-white rounded-xl shadow text-center text-gray-600">
          {pesan || "Memuat data..."}
        </div>
      )}
    </main>
  );
}
