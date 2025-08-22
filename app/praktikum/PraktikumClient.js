"use client";

import { useState } from "react";

export default function PraktikumClient({ data, user }) {
  const [list, setList] = useState(data);
  const [form, setForm] = useState({
    Mata_Kuliah: "",
    Jurusan: "",
    Kelas: "",
    Semester: "",
    Hari: "",
    Jam_Mulai: "",
    Jam_Ahir: "",
    Shift: "",
    Assisten: "",
    Catatan: "",
    Tanggal_Mulai: "",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Tambah / Update
  const save = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, ID: editId } : form;

    const res = await fetch("/api/praktikum", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowModal(false);
      location.reload();
    }
  };

  // Hapus
  const del = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    const res = await fetch(`/api/praktikum?id=${id}`, { method: "DELETE" });
    if (res.ok) location.reload();
  };

  // Buka modal
  const openModal = (p = null) => {
    if (p) {
      setEditId(p.ID);
      setForm(p);
    } else {
      setEditId(null);
      setForm({
        Mata_Kuliah: "",
        Jurusan: "",
        Kelas: "",
        Semester: "",
        Hari: "",
        Jam_Mulai: "",
        Jam_Ahir: "",
        Shift: "",
        Assisten: "",
        Catatan: "",
        Tanggal_Mulai: "",
      });
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
          Tambah Praktikum
        </button>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto relative z-0">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Mata Kuliah</th>
              <th className="border px-3 py-2">Jurusan</th>
              <th className="border px-3 py-2">Kelas</th>
              <th className="border px-3 py-2">Hari</th>
              <th className="border px-3 py-2">Jam</th>
              <th className="border px-3 py-2">Shift</th>
              <th className="border px-3 py-2">Asisten</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.ID} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{p.ID}</td>
                <td className="border px-3 py-1">{p.Mata_Kuliah}</td>
                <td className="border px-3 py-1">{p.Jurusan}</td>
                <td className="border px-3 py-1">{p.Kelas}</td>
                <td className="border px-3 py-1">{p.Hari}</td>
                <td className="border px-3 py-1">{p.Jam_Mulai} - {p.Jam_Ahir}</td>
                <td className="border px-3 py-1">{p.Shift}</td>
                <td className="border px-3 py-1">{p.Assisten}</td>
                <td className="border px-3 py-1 space-x-1">
                  {(user.role === "admin" || user.role === "laboran") && (
                    <>
                      <button
                        onClick={() => openModal(p)}
                        className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(p.ID)}
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
              {editId ? "Edit Praktikum" : "Tambah Praktikum"}
            </h3>

            <div className="space-y-2">
              {[
                { placeholder: "Mata Kuliah", key: "Mata_Kuliah" },
                { placeholder: "Jurusan", key: "Jurusan" },
                { placeholder: "Kelas", key: "Kelas" },
                { placeholder: "Semester", key: "Semester" },
                { placeholder: "Hari", key: "Hari" },
                { placeholder: "Shift", key: "Shift" },
                { placeholder: "Asisten", key: "Assisten" },
                { placeholder: "Catatan", key: "Catatan" },
              ].map((f) => (
                <input
                  key={f.key}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              ))}

              <div className="flex gap-2">
                <input
                  type="time"
                  value={form.Jam_Mulai}
                  onChange={(e) => setForm({ ...form, Jam_Mulai: e.target.value })}
                  className="w-1/2 border px-3 py-2 rounded"
                />
                <input
                  type="time"
                  value={form.Jam_Ahir}
                  onChange={(e) => setForm({ ...form, Jam_Ahir: e.target.value })}
                  className="w-1/2 border px-3 py-2 rounded"
                />
              </div>

              <input
                type="date"
                value={form.Tanggal_Mulai}
                onChange={(e) => setForm({ ...form, Tanggal_Mulai: e.target.value })}
                className="w-full border px-3 py-2 rounded"
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
