"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * 📋 Halaman Profil Praktikan
 * - Menampilkan data praktikan dari token login
 * - Jika status aktif → tampilkan menu
 */
export default function PageClient({ user }) {
  const router = useRouter();
  const [praktikan, setPraktikan] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/praktikan", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPraktikan(data);
        }
      } catch (err) {
        console.error("Fetch praktikan error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Logout
  const handleLogout = async () => {
    await fetch("/api/auth_praktikan/logout", { method: "POST" });
    router.push("/");
  };

  if (loading)
    return <p className="text-center py-10">Memuat data profil...</p>;
  if (!praktikan)
    return (
      <p className="text-center py-10 text-red-600">
        Data praktikan tidak ditemukan
      </p>
    );

  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      {/* Header Profil */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Mahasiswa</h1>
        <p className="mt-2 text-gray-600">
          Halo, {praktikan.nama} ({praktikan.username})
        </p>
        <p className="text-gray-500 text-sm">
          NIM: {praktikan.nim} | No. HP: {praktikan.nomorhp}
        </p>
        <p
          className={`mt-2 font-semibold ${
            praktikan.status === "aktif" ? "text-green-600" : "text-red-600"
          }`}
        >
          Status: {praktikan.status}
        </p>
      </div>

      {/* Menu jika status aktif */}
      {praktikan.status === "aktif" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/profil/presensi"
            className="p-4 bg-blue-100 rounded-xl shadow hover:bg-blue-200 transition block text-center"
          >
            Presensi
          </Link>

          <Link
            href="/profil/kumpul_tugas"
            className="p-4 bg-yellow-100 rounded-xl shadow hover:bg-yellow-200 transition block text-center"
          >
            Kumpulkan Tugas
          </Link>

          <button className="p-4 bg-green-100 rounded-xl shadow hover:bg-green-200 transition">
            Aktivitas
          </button>
          <button className="p-4 bg-purple-100 rounded-xl shadow hover:bg-purple-200 transition">
            Pengumuman
          </button>

          <Link
            href="/profil/akun"
            className="p-4 bg-orange-100 rounded-xl shadow hover:bg-orange-200 transition block text-center"
          >
            Akun
          </Link>

          <button
            onClick={handleLogout}
            className="p-4 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-center text-red-600 font-semibold">
          Akun belum aktif. Silakan hubungi admin/laboran.
        </div>
      )}
    </main>
  );
}
