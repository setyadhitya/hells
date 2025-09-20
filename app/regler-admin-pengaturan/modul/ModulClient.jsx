"use client";

import { useState, useEffect } from "react";

export default function ModulClient({ user }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ judul: "", deskripsi: "" });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Ambil data modul dari API
  const loadData = async () => {
    const res = await fetch("/regler-admin-pengaturan/api/modul", {
      cache: "no-store",
    });
    const data = await res.json();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Save (Tambah / Update)
  const save = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;

    const res = await fetch("/regler-admin-pengaturan/api/modul", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      alert(result.error || "Terjadi kesalahan");
      return;
    }

    setShowModal(false);
    loadData();
  };

  // 🔹 Delete
  const del = async (id) => {
    if (!confirm("Hapus modul ini?")) return;
    const res = await fetch(`/regler-admin-pengaturan/api/modul/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadData();
  };

  // 🔹 Buka modal
  const openModal = (m = null) => {
    if (m) {
      setEditId(m.id);
      setForm(m);
    } else {
      setEditId(null);
      setForm({ judul: "", deskripsi: "" });
    }
    setShowModal(true);
  };

  return (
    <div className="relative p-2">
      {/* Tombol Tambah */}
      {(user.role === "admin" || user.role === "laboran") && (
        <button
          onClick={() => openModal()}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tambah Modul
        </button>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto relative z-0">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Judul</th>
              <th className="border px-3 py-2">Deskripsi</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{m.id}</td>
                <td className="border px-3 py-1">{m.judul}</td>
                <td className="border px-3 py-1">{m.deskripsi}</td>
                <td className="border px-3 py-1 space-x-1">
                  {(user.role === "admin" || user.role === "laboran") && (
                    <>
                      <button
                        onClick={() => openModal(m)}
                        className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(m.id)}
                        className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </>
                  )}
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
              {editId ? "Edit Modul" : "Tambah Modul"}
            </h3>

            <div className="space-y-2">
              {/* Judul */}
              <input
                placeholder="Judul Modul"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />

              {/* Deskripsi */}
              <textarea
                placeholder="Deskripsi Modul"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
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
