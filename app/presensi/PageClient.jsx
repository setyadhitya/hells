"use client";
import { useState } from "react";

export default function PageClient({ user }) {
  const [kode, setKode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePresensi = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lokasi = `${pos.coords.latitude},${pos.coords.longitude}`;

            const res = await fetch("/api/presensi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kode,
                lokasi, // kirim lokasi GPS
                user,   // user dari token
              }),
            });

            const data = await res.json();
            if (res.ok) {
              setMessage(`✅ ${data.message}`);
            } else {
              setMessage(`❌ ${data.error}`);
            }
            setLoading(false);
          },
          (err) => {
            setMessage("❌ Gagal ambil lokasi: " + err.message);
            setLoading(false);
          }
        );
      } else {
        setMessage("❌ Browser tidak mendukung GPS");
        setLoading(false);
      }
    } catch (err) {
      setMessage("❌ Terjadi kesalahan server");
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Presensi Praktikum</h1>

      <form onSubmit={handlePresensi} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Masukkan Kode Presensi"
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Submit Presensi"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center font-medium">{message}</p>
      )}
    </main>
  );
}
