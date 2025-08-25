"use client";

import { useState } from "react";

export default function HalamanClient({ data, moduls }) {
  const [list, setList] = useState(data);
  const [form, setForm] = useState({ modul_id: "", nomor_halaman: "", isi: "" });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Simpan (Tambah / Update)
  const save = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `/regler-admin-pengaturan/api/halaman/${editId}`
      : `/regler-admin-pengaturan/api/halaman`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      alert(result.error || "Terjadi kesalahan");
      return;
    }

    setShowModal(false);
    location.reload(); // refresh list
  };

  // Hapus
  const del = async (id) => {
    if (!confirm("Hapus halaman ini?")) return;
    const res = await fetch(`/regler-admin-pengaturan/api/halaman/${id}`, {
      method: "DELETE",
    });
    if (res.ok) location.reload();
  };

  // Buka modal
  const openModal = (h = null) => {
    if (h) {
      setEditId(h.id);
      setForm({
        modul_id: h.modul_id,
        nomor_halaman: h.nomor_halaman,
        isi: h.isi,
      });
    } else {
      setEditId(null);
      setForm({ modul_id: "", nomor_halaman: "", isi: "" });
    }
    setShowModal(true);
  };

  return (
    <div className="relative p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Halaman Modul</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Tambah Halaman
        </button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto relative z-0">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Modul</th>
              <th className="border px-3 py-2">Nomor</th>
              <th className="border px-3 py-2">Isi</th>
              <th className="border px-3 py-2">Tanggal</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{h.id}</td>
                <td className="border px-3 py-1">
                  {moduls.find((m) => m.id === h.modul_id)?.judul || "-"}
                </td>
                <td className="border px-3 py-1">{h.nomor_halaman}</td>
                <td className="border px-3 py-1">{h.isi}</td>
                <td suppressHydrationWarning className="border px-3 py-1">
  {new Date().toLocaleDateString("id-ID")}
</td>
                <td className="border px-3 py-1 space-x-2">
                  <button
                    onClick={() => openModal(h)}
                    className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => del(h.id)}
                    className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={save}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-6 animate-slide-up shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Halaman" : "Tambah Halaman"}
            </h3>

            <div className="space-y-3">
              {/* Modul */}
              <select
                value={form.modul_id}
                onChange={(e) => setForm({ ...form, modul_id: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Modul --</option>
                {moduls.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.judul}
                  </option>
                ))}
              </select>

              {/* Nomor Halaman */}
              <input
                type="number"
                placeholder="Nomor Halaman"
                value={form.nomor_halaman}
                onChange={(e) =>
                  setForm({ ...form, nomor_halaman: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />

              {/* Isi */}
              <textarea
                placeholder="Isi Halaman"
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editId ? "Update" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
