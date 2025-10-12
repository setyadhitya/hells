"use client";

import { useEffect, useState } from "react";

// 🔹 Fungsi bantu untuk ambil cookie CSRF
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

export default function ApproveClient({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================== 🔹 Ambil daftar akun pendaftaran ====================
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve", {
        credentials: "include", // 🧩 Kirim cookie JWT
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data");
      setList(data);
    } catch (err) {
      console.error("Load data error:", err);
      alert("Gagal memuat data pendaftaran akun");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==================== 🔹 Approve akun praktikan ====================
  const approve = async (akun) => {
    if (!confirm(`Anda yakin ingin approve akun "${akun.nama}" ?`)) return;

    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        credentials: "include", // 🧩 agar cookie token terkirim
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCookie("csrf_token"), // 🧩 CSRF token
        },
        body: JSON.stringify({
          id: akun.id,
          username: akun.username,
          password: akun.password, // password hasil pendaftaran
          nama: akun.nama,
          nim: akun.nim,
          nomorhp: akun.nomorhp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal approve akun");
        return;
      }

      alert(data.message || "Akun berhasil di-approve");

      // 🔄 Update status di state tanpa reload seluruh tabel
      setList((prev) =>
        prev.map((item) =>
          item.id === akun.id ? { ...item, status: "approve" } : item
        )
      );
    } catch (err) {
      console.error("Approve error:", err);
      alert("Terjadi kesalahan jaringan");
    }
  };

  // ==================== 🔹 Tampilan utama ====================
  return (
    <main className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Approve Akun Praktikan</h1>
      <p className="mt-2 text-gray-600">
        Halo, {user.username} ({user.role})
      </p>

      {loading ? (
        <p className="mt-4 text-gray-500">Memuat data akun...</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Username</th>
                <th className="border px-3 py-2">Nama</th>
                <th className="border px-3 py-2">NIM</th>
                <th className="border px-3 py-2">No. HP</th>
                <th className="border px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Tidak ada data pendaftaran
                  </td>
                </tr>
              ) : (
                list.map((akun) => (
                  <tr key={akun.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{akun.id}</td>
                    <td className="border px-3 py-2">{akun.username}</td>
                    <td className="border px-3 py-2">{akun.nama}</td>
                    <td className="border px-3 py-2">{akun.nim}</td>
                    <td className="border px-3 py-2">{akun.nomorhp}</td>
                    <td className="border px-3 py-2 text-center">
                      {akun.status === "waiting" ? (
                        <button
                          onClick={() => approve(akun)}
                          className="px-3 py-1 rounded text-white bg-red-500 hover:bg-green-600 transition-colors"
                        >
                          Waiting
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded text-white bg-green-600">
                          Approved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
