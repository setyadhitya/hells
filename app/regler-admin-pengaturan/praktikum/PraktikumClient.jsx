"use client";

import { useState, useEffect } from "react";

export default function PraktikumClient({ user }) {
  const daftarMataKuliah = [
    "Pengantar Teknologi Informasi",
    "Basis Data",
    "Struktur Data dan Algoritma",
    "Pemrograman Klient Server",
    "Pemrograman Web",
    "Pemrograman Berorientasi Objek",
    "Sistem Operasi",
    "Jaringan Komputer",
  ];

  const daftarJurusan = ["Resiskom", "Informatika", "Statistika"];

  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    Mata_Kuliah: "",
    Mata_Kuliah_Select: "",
    Jurusan: "",
    Jurusan_Select: "",
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

  useEffect(() => {
    fetch("/api/admin/praktikum")
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch(console.error);
  }, []);

  const save = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, ID: editId } : form;

    const res = await fetch("/api/admin/praktikum", {
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
    location.reload();
  };

  const del = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    const res = await fetch(`/api/admin/praktikum?id=${id}`, { method: "DELETE" });
    if (res.ok) location.reload();
  };

  const openModal = (p = null) => {
    if (p) {
      setEditId(p.ID);

      setForm({
        ...p,
        Mata_Kuliah_Select: daftarMataKuliah.includes(p.Mata_Kuliah)
          ? p.Mata_Kuliah
          : "Lainnya",
        Mata_Kuliah: p.Mata_Kuliah,
        Jurusan_Select: daftarJurusan.includes(p.Jurusan)
          ? p.Jurusan
          : "Lainnya",
        Jurusan: p.Jurusan,
      });
    } else {
      setEditId(null);
      setForm({
        Mata_Kuliah: "",
        Mata_Kuliah_Select: "",
        Jurusan: "",
        Jurusan_Select: "",
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
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Praktikum</h1>
      <p className="mt-2 text-gray-700">
        Halo, {user.username} — role: {user.role}
      </p>

      {(user.role === "admin" || user.role === "laboran") && (
        <button
          onClick={() => openModal()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tambah Praktikum
        </button>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Mata Kuliah</th>
              <th className="border px-3 py-2">Jurusan</th>
              <th className="border px-3 py-2">Kelas</th>
              <th className="border px-3 py-2">Semester</th>
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
                <td className="border px-3 py-1">{p.Semester}</td>
                <td className="border px-3 py-1">{p.Hari}</td>
                <td className="border px-3 py-1">
                  {p.Jam_Mulai} - {p.Jam_Ahir}
                </td>
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
              {editId ? "Edit Praktikum" : "Tambah Praktikum"}
            </h3>

            {/* Dropdown Mata Kuliah */}
            <select
              value={form.Mata_Kuliah_Select}
              onChange={(e) => {
                const val = e.target.value;
                setForm({
                  ...form,
                  Mata_Kuliah_Select: val,
                  Mata_Kuliah: val === "Lainnya" ? "" : val,
                });
              }}
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Mata Kuliah</option>
              <option value="Pengantar Teknologi Informasi">Pengantar Teknologi Informasi</option>
              <option value="Basis Data">Basis Data</option>
              <option value="Struktur Data dan Algoritma">Struktur Data dan Algoritma</option>
              <option value="Pemrograman Klient Server">Pemrograman Klient Server</option>
              <option value="Pemrograman Web">Pemrograman Web</option>
              <option value="Pemrograman Berorientasi Objek">Pemrograman Berorientasi Objek</option>
              <option value="Sistem Operasi">Sistem Operasi</option>
              <option value="Jaringan Komputer">Jaringan Komputer</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            {form.Mata_Kuliah_Select === "Lainnya" && (
              <input
                placeholder="Mata Kuliah Lainnya"
                value={form.Mata_Kuliah}
                onChange={(e) =>
                  setForm({ ...form, Mata_Kuliah: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* Dropdown Jurusan */}
            <select
              value={form.Jurusan_Select}
              onChange={(e) =>
                setForm({
                  ...form,
                  Jurusan_Select: e.target.value,
                  Jurusan: e.target.value === "Lainnya" ? "" : e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Jurusan</option>
              {daftarJurusan.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>

            {form.Jurusan_Select === "Lainnya" && (
              <input
                placeholder="Jurusan Lainnya"
                value={form.Jurusan}
                onChange={(e) =>
                  setForm({ ...form, Jurusan: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

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
    </main>
  );
}
