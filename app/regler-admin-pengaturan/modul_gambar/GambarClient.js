"use client";

import { useState } from "react";

export default function GambarClient({ data, modul, halaman }) {
  const [list, setList] = useState(data || []);
  const [form, setForm] = useState({
    modul_id: "",
    halaman_id: "",
    file: null,
    keterangan: "",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter halaman sesuai modul
  const halamanFiltered = form.modul_id
    ? halaman.filter((h) => h.modul_id === parseInt(form.modul_id))
    : [];

  // Tambah / Update
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `/regler-admin-pengaturan/api/modul_gambar/${editId}`
        : `/regler-admin-pengaturan/api/modul_gambar`;

      const fd = new FormData();
      fd.append("modul_id", form.modul_id);
      fd.append("halaman_id", form.halaman_id);
      fd.append("keterangan", form.keterangan);
      if (form.file) fd.append("gambar", form.file);

      const res = await fetch(url, { method, body: fd });
      const result = await res.json();

      if (!res.ok || result.error) {
        alert(result.error || "Terjadi kesalahan");
        return;
      }

      if (editId) {
        // update di state
        setList((prev) =>
          prev.map((item) => (item.id === editId ? result : item))
        );
      } else {
        // tambah ke state
        setList((prev) => [...prev, result]);
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  // Hapus
  const del = async (id) => {
    if (!confirm("Hapus gambar ini?")) return;

    try {
      const res = await fetch(`/regler-admin-pengaturan/api/modul_gambar/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal hapus data");

      setList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  };

  // Buka modal
  const openModal = (g = null) => {
    if (g) {
      setEditId(g.id);
      setForm({
        modul_id: g.modul_id,
        halaman_id: g.halaman_id,
        file: null,
        keterangan: g.keterangan || "",
      });
    } else {
      setEditId(null);
      setForm({ modul_id: "", halaman_id: "", file: null, keterangan: "" });
    }
    setShowModal(true);
  };

  return (
    <div className="relative p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Gambar Halaman</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Tambah Gambar
        </button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto relative z-0">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Modul</th>
              <th className="border px-3 py-2">Halaman</th>
              <th className="border px-3 py-2">Gambar</th>
              <th className="border px-3 py-2">Keterangan</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{g.id}</td>
                <td className="border px-3 py-1">
                  {modul.find((m) => m.id === g.modul_id)?.judul || "-"}
                </td>
                <td className="border px-3 py-1">
                  {halaman.find((h) => h.id === g.halaman_id)?.nomor_halaman ||
                    "-"}
                </td>
                <td className="border px-3 py-1">
                  <img
                    src={g.gambar_path}
                    alt={g.keterangan}
                    className="w-20 h-20 object-cover rounded"
                  />
                </td>
                <td className="border px-3 py-1">{g.keterangan}</td>
                <td className="border px-3 py-1 space-x-2">
                  <button
                    onClick={() => openModal(g)}
                    className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => del(g.id)}
                    className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Belum ada gambar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={save}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Gambar" : "Tambah Gambar"}
            </h3>

            <div className="space-y-3">
              {/* Modul */}
              <select
                value={form.modul_id}
                onChange={(e) =>
                  setForm({ ...form, modul_id: e.target.value, halaman_id: "" })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Modul --</option>
                {modul.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.judul}
                  </option>
                ))}
              </select>

              {/* Halaman */}
              <select
                value={form.halaman_id}
                onChange={(e) =>
                  setForm({ ...form, halaman_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Halaman --</option>
                {halamanFiltered.map((h) => (
                  <option key={h.id} value={h.id}>
                    Halaman {h.nomor_halaman}
                  </option>
                ))}
              </select>

              {/* File gambar */}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files[0] || null })
                }
                className="w-full border px-3 py-2 rounded"
                required={!editId}
              />

              {/* Keterangan */}
              <textarea
                placeholder="Keterangan"
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                className="w-full border px-3 py-2 rounded h-24"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : editId ? "Update" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
