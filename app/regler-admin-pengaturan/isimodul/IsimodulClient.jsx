"use client";

import { useState, useEffect } from "react";

export default function IsimodulClient({ user }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ mata_kuliah: "", pertemuan: "", gambar: null, deskripsi: "" });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modulList, setModulList] = useState([]);
  const [pertemuanList, setPertemuanList] = useState([]);

  // 🔹 Load isi modul
  const loadData = async () => {
    const res = await fetch("/api/admin/isimodul", { cache: "no-store" });
    const data = await res.json();
    setList(data);
  };

  // 🔹 Ambil daftar modul
  const loadModul = async () => {
    const res = await fetch("/api/admin/modul", { cache: "no-store" });
    const data = await res.json();
    setModulList(data);
  };

  // 🔹 Ambil pertemuan sesuai mata kuliah
  const loadPertemuan = (mk) => {
    const filtered = modulList
      .filter((m) => m.mata_kuliah === mk)
      .map((m) => m.pertemuan);
    setPertemuanList(filtered);
  };

  useEffect(() => {
    loadData();
    loadModul();
  }, []);

  // 🔹 Save (Tambah / Update)
  const save = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("mata_kuliah", form.mata_kuliah);
    fd.append("pertemuan", form.pertemuan);
    fd.append("deskripsi", form.deskripsi);
    if (form.gambar instanceof File) fd.append("gambar", form.gambar);

    let url = "/api/admin/isimodul";
    let method = "POST";

    if (editId) {
      fd.append("id", editId);
      method = "PUT";
    }

    const res = await fetch(url, { method, body: fd });
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
    if (!confirm("Hapus isi modul ini?")) return;
    const res = await fetch(`/api/admin/isimodul?id=${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  };

  // 🔹 Open modal
  const openModal = (m = null) => {
    if (m) {
      setEditId(m.id);
      setForm({
        mata_kuliah: m.mata_kuliah || "",
        pertemuan: m.pertemuan || "",
        gambar: m.gambar || null,
        deskripsi: m.deskripsi || "",
      });
      loadPertemuan(m.mata_kuliah);
    } else {
      setEditId(null);
      setForm({ mata_kuliah: "", pertemuan: "", gambar: null, deskripsi: "" });
    }
    setShowModal(true);
  };

  return (
    <div className="relative p-2">
      {(user.role === "admin" || user.role === "laboran") && (
        <button
          onClick={() => openModal()}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tambah Isi Modul
        </button>
      )}

      {/* Table */}
      <div className="overflow-x-auto relative z-0">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Mata Kuliah</th>
              <th className="border px-3 py-2">Pertemuan</th>
              <th className="border px-3 py-2">Gambar</th>
              <th className="border px-3 py-2">Deskripsi</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m, i) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{i + 1}</td>
                <td className="border px-3 py-1">{m.mata_kuliah}</td>
                <td className="border px-3 py-1">{m.pertemuan}</td>
                <td className="border px-3 py-1">
                  {m.gambar && (
                    <img
                      src={m.gambar}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>
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
              {editId ? "Edit Isi Modul" : "Tambah Isi Modul"}
            </h3>

            <div className="space-y-2">
              {/* Dropdown Mata Kuliah */}
              <select
                value={form.mata_kuliah}
                onChange={(e) => {
                  setForm({ ...form, mata_kuliah: e.target.value, pertemuan: "" });
                  loadPertemuan(e.target.value);
                }}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {[...new Set(modulList.map((mk) => mk.mata_kuliah))].map((mk, i) => (
                  <option key={i} value={mk}>
                    {mk}
                  </option>
                ))}
              </select>

              {/* Dropdown Pertemuan sesuai mata kuliah */}
              <select
                value={form.pertemuan}
                onChange={(e) => setForm({ ...form, pertemuan: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Pertemuan --</option>
                {pertemuanList.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Gambar (file upload) */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, gambar: e.target.files[0] })}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Deskripsi */}
              <textarea
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                rows={4}
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
