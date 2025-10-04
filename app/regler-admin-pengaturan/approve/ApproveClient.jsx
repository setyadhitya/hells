"use client";

import { useEffect, useState } from "react";

export default function ApproveClient({ user }) {
  const [list, setList] = useState([]);

  const loadData = async () => {
    const res = await fetch("/api/admin/approve");
    const data = await res.json();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (akun) => {
    if (!confirm(`Anda yakin approve akun ${akun.nama}?`)) return;

    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: akun.id,
        username: akun.username,
        password: akun.password, // langsung pakai password hasil pendaftaran
        nama: akun.nama,
        nim: akun.nim,
        nomorhp: akun.nomorhp,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Gagal approve");
      return;
    }

    // update di state tanpa reload seluruh tabel
    setList((prev) =>
      prev.map((item) =>
        item.id === akun.id ? { ...item, status: "approve" } : item
      )
    );
  };

  return (
    <main className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Approve Akun Praktikan</h1>
      <p className="mt-2 text-gray-600">Halo {user.username} (Admin)</p>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Username</th>
              <th className="border px-3 py-2">Nama</th>
              <th className="border px-3 py-2">NIM</th>
              <th className="border px-3 py-2">No. HP</th>
              <th className="border px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((akun) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
