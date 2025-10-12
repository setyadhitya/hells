"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ diperlukan untuk navigasi internal

export default function PageClient({ user }) {
  const router = useRouter();
  const [assisten, setAssisten] = useState(null); // data asisten login
  const [loading, setLoading] = useState(true);   // state loading
  const [error, setError] = useState("");         // pesan error

  // ==================== 🔹 Ambil data profil asisten ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/assisten", {
          credentials: "include", // 🧩 kirim cookie JWT ke server
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal mengambil data asisten");
        }

        setAssisten(data);
      } catch (err) {
        console.error("Fetch Asisten Error:", err);
        setError("Gagal memuat data asisten. Silakan login ulang.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==================== 🔹 Fungsi Logout ====================
  const handleLogout = async () => {
    try {
      await fetch("/api/auth_assisten/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login_assisten"); // arahkan ke login
    } catch (err) {
      console.error("Logout error:", err);
      alert("Gagal logout. Coba lagi.");
    }
  };

  // ==================== 🔹 Kondisi tampilan ====================
  if (loading)
    return <p className="text-center py-10 text-gray-500">Memuat data...</p>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error}
        <button
          onClick={() => router.push("/login_assisten")}
          className="block mt-4 mx-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login Ulang
        </button>
      </div>
    );

  if (!assisten)
    return (
      <p className="text-center py-10 text-red-600">
        Data asisten tidak ditemukan
      </p>
    );

  // ==================== 🔹 Tampilan utama ====================
  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      {/* 🔸 Header Profil */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 border">
        <h1 className="text-2xl font-bold text-gray-800">Halaman Asisten</h1>
        <p className="mt-2 text-gray-600">Halo, {assisten.nama}</p>
        <p className="text-gray-500 text-sm">
          NIM: {assisten.nim} | No. HP: {assisten.nomorhp}
        </p>
        <p
          className={`mt-2 font-semibold ${
            assisten.status === "aktif"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          Status: {assisten.status}
        </p>
      </div>

      {/* 🔸 Menu (tampil hanya jika status aktif) */}
      {assisten.status === "aktif" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* ✅ Menu Buat Kode Presensi */}
          <Link
            href="/akun_assisten/kode_presensi"
            className="p-4 bg-blue-100 rounded-xl shadow hover:bg-blue-200 transition block text-center"
          >
            Buat Kode Presensi
          </Link>

          {/* ✅ Menu Penugasan */}
          <Link
            href="/akun_assisten/beri_tugas"
            className="p-4 bg-yellow-100 rounded-xl shadow hover:bg-yellow-200 transition block text-center"
          >
            Penugasan
          </Link>

          {/* ✅ Menu Aktivitas */}
          <button className="p-4 bg-green-100 rounded-xl shadow hover:bg-green-200 transition block text-center">
            Aktivitas
          </button>

          {/* ✅ Menu Pengumuman */}
          <button className="p-4 bg-purple-100 rounded-xl shadow hover:bg-purple-200 transition block text-center">
            Pengumuman
          </button>

          {/* ✅ Menu Akun */}
          <Link
            href="/akun_assisten/akun"
            className="p-4 bg-orange-100 rounded-xl shadow hover:bg-orange-200 transition block text-center"
          >
            Akun
          </Link>

          {/* 🔴 Tombol Logout */}
          <button
            onClick={handleLogout}
            className="p-4 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 transition block text-center"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-center text-red-600 font-semibold">
          Akun Assisten belum aktif. Silakan hubungi admin atau laboran.
        </div>
      )}
    </main>
  );
}
