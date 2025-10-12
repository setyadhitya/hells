"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function PageClient({ user }) {
  const [kode, setKode] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  const handlePresensi = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus("");
    setLoading(true);

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lokasi = `${pos.coords.latitude},${pos.coords.longitude}`;

            const res = await fetch("/api/presensi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kode, lokasi }),
            });

            const data = await res.json();
            console.log("Response presensi:", data);

            if (res.ok) {
              setMessage(data.message || "Presensi berhasil ✅");
              setStatus("success");
              setKode("");

              // 🌟 Hilangkan otomatis setelah 3 detik
              setTimeout(() => {
                setMessage("");
                setStatus("");
              }, 3000);
            } else {
              setMessage(data.error || "Terjadi kesalahan saat presensi");
              setStatus("error");
            }

            setLoading(false);
          },
          (err) => {
            setMessage("Gagal mendapatkan lokasi: " + err.message);
            setStatus("error");
            setLoading(false);
          }
        );
      } else {
        setMessage("Browser tidak mendukung fitur lokasi (GPS)");
        setStatus("error");
        setLoading(false);
      }
    } catch (err) {
      setMessage("Terjadi kesalahan server");
      setStatus("error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Presensi Praktikum
        </h1>

        <form onSubmit={handlePresensi} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Masukkan Kode Presensi"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-lg"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Mengirim..." : "Kirim Presensi"}
          </button>
        </form>

        {/* Pesan notifikasi (animasi muncul/hilang) */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className={`mt-6 p-3 rounded-lg flex items-center justify-center gap-2 text-center text-sm font-medium shadow-sm ${
                status === "success"
                  ? "bg-green-100 text-green-700 border border-green-400"
                  : "bg-red-100 text-red-700 border border-red-400"
              }`}
            >
              {status === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info tambahan user */}
        <p className="text-xs text-gray-400 mt-6 text-center">
          Login sebagai: <span className="font-semibold">{user?.username}</span>
        </p>
      </motion.div>
    </main>
  );
}
