"use client";

import { useState, useEffect } from "react";

export default function IsimodulClient({ user }) {
  const [list, setList] = useState([]);
  const [modulList, setModulList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const [filterMataKuliah, setFilterMataKuliah] = useState("");
  const [filterPertemuan, setFilterPertemuan] = useState("");

  const [form, setForm] = useState({
    modul_id: "",
    halaman: "",
    deskripsi: "",
    gambar: null,
  });

  const halamanList = Array.from({ length: 50 }, (_, i) => i + 1);

  // 🔹 Ambil semua data isi modul
  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/isimodul", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        console.error("Data isi modul tidak valid:", data);
        setList([]);
        return;
      }
      setList(data);
    } catch (err) {
      console.error("Gagal memuat isi modul:", err);
      setList([]);
    }
  };

  // 🔹 Ambil daftar modul
  const loadModulList = async () => {
    try {
      const res = await fetch("/api/admin/modul", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setModulList(data);
      else console.error("Data modul tidak valid:", data);
    } catch (err) {
      console.error("Gagal memuat modul:", err);
    }
  };

  useEffect(() => {
    loadData();
    loadModulList();
  }, []);

  // 🔹 Simpan data (Tambah / Update)
  const save = async (e) => {
    e.preventDefault();

    // Cek duplikasi
    const exists = list.find(
      (item) =>
        item.modul_id == form.modul_id &&
        item.halaman == form.halaman &&
        item.id !== editId
    );
    if (exists) {
      alert("Halaman ini sudah ada untuk modul tersebut!");
      return;
    }

    const fd = new FormData();
    fd.append("modul_id", form.modul_id);
    fd.append("halaman", form.halaman);
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
      alert(result.error || "Terjadi kesalahan saat menyimpan.");
      return;
    }

    setShowModal(false);
    await loadData();
  };

  // 🔹 Hapus isi modul
  const del = async (id) => {
    if (!confirm("Yakin ingin menghapus isi modul ini?")) return;
    const res = await fetch(`/api/admin/isimodul?id=${id}`, { method: "DELETE" });
    if (res.ok) await loadData();
  };

  // 🔹 Buka modal tambah/edit
  const openModal = (m = null) => {
    if (m) {
      setEditId(m.id);
      setForm({
        modul_id: m.modul_id || "",
        halaman: m.halaman || "",
        deskripsi: m.deskripsi || "",
        gambar: null,
      });
      if (m.gambar) {
        setPreviewUrl(m.gambar);
        setFileName(m.gambar.split("/").pop());
      } else {
        setPreviewUrl(null);
        setFileName("");
      }
    } else {
      setEditId(null);
      setForm({
        modul_id: "",
        halaman: "",
        deskripsi: "",
        gambar: null,
      });
      setPreviewUrl(null);
      setFileName("");
    }
    setShowModal(true);
  };

  // 🔹 Filter data dinamis
  const filteredList = list.filter((item) => {
    const matchMataKuliah = filterMataKuliah
      ? item.mata_kuliah === filterMataKuliah
      : true;
    const matchPertemuan = filterPertemuan
      ? item.pertemuan === filterPertemuan
      : true;
    const matchSearch = search
      ? item.deskripsi?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchMataKuliah && matchPertemuan && matchSearch;
  });

  // 🔹 Ambil daftar pertemuan dari modulList yang difilter
  const pertemuanOptions = modulList
    .filter((m) => (filterMataKuliah ? m.mata_kuliah === filterMataKuliah : true))
    .map((m) => m.pertemuan);

  return (
    <div className="relative p-2">
      {/* 🔍 Filter dan pencarian */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          value={filterMataKuliah}
          onChange={(e) => {
            setFilterMataKuliah(e.target.value);
            setFilterPertemuan("");
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Semua Mata Kuliah --</option>
          {[...new Set(modulList.map((m) => m.mata_kuliah))].map((mk, i) => (
            <option key={i} value={mk}>
              {mk}
            </option>
          ))}
        </select>

        <select
          value={filterPertemuan}
          onChange={(e) => setFilterPertemuan(e.target.value)}
          className="border px-3 py-2 rounded"
          disabled={!filterMataKuliah}
        >
          <option value="">-- Semua Pertemuan --</option>
          {pertemuanOptions.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
        />
      </div>

      {/* Tombol Tambah */}
      {(user.role === "admin" || user.role === "laboran") && (
        <button
          onClick={() => openModal()}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tambah Isi Modul
        </button>
      )}

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Mata Kuliah</th>
              <th className="border px-3 py-2">Pertemuan</th>
              <th className="border px-3 py-2">Halaman</th>
              <th className="border px-3 py-2">Deskripsi</th>
              <th className="border px-3 py-2">Gambar</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((m, i) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1 text-center">{i + 1}</td>
                <td className="border px-3 py-1">{m.mata_kuliah}</td>
                <td className="border px-3 py-1">{m.pertemuan}</td>
                <td className="border px-3 py-1 text-center">{m.halaman}</td>
                <td className="border px-3 py-1">{m.deskripsi}</td>
                <td className="border px-3 py-1 text-center">
                  {m.gambar && (
                    <img
                      src={m.gambar}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>
                <td className="border px-3 py-1 text-center space-x-1">
                  {(user.role === "admin" || user.role === "laboran") && (
                    <>
                      <button
                        onClick={() => openModal(m)}
                        className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(m.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <form
            onSubmit={save}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Isi Modul" : "Tambah Isi Modul"}
            </h3>

            <div className="space-y-3">
              {/* Pilih Modul */}
              <select
                value={form.modul_id}
                onChange={(e) =>
                  setForm({ ...form, modul_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Modul --</option>
                {modulList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.mata_kuliah} — {m.pertemuan}
                  </option>
                ))}
              </select>

              {/* Pilih Halaman */}
              <select
                value={form.halaman}
                onChange={(e) =>
                  setForm({ ...form, halaman: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Halaman --</option>
                {halamanList.map((h) => (
                  <option key={h} value={h}>
                    Halaman {h}
                  </option>
                ))}
              </select>

              {/* Upload Gambar */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setForm({ ...form, gambar: file });
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file));
                    setFileName(file.name);
                  } else {
                    setPreviewUrl(null);
                    setFileName("");
                  }
                }}
                className="w-full border px-3 py-2 rounded"
              />

              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  {fileName && (
                    <p className="text-xs text-gray-500 mt-1">
                      File: {fileName}
                    </p>
                  )}
                </div>
              )}

              {/* Deskripsi */}
              <textarea
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
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
