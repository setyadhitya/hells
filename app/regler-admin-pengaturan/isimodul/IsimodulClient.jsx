"use client";

import { useState, useEffect } from "react";

export default function IsimodulClient({ user }) {
  const [filterMataKuliah, setFilterMataKuliah] = useState("");
  const [filterPertemuan, setFilterPertemuan] = useState("");
  const [pertemuanOptions, setPertemuanOptions] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    mata_kuliah: "",
    pertemuan: "",
    gambar: null,
    deskripsi: "",
    halaman: "",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modulList, setModulList] = useState([]);
  const [pertemuanList, setPertemuanList] = useState([]);
  // daftar halaman 1 sampai 50
  const halamanList = Array.from({ length: 50 }, (_, i) => i + 1);

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
  const loadPertemuan = async (mk) => {
    if (!mk) {
      setPertemuanList([]);
      return [];
    }
    const res = await fetch("/api/admin/pertemuan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mata_kuliah: mk }),
    });
    const data = await res.json();
    const perts = (Array.isArray(data) ? data.map((r) => String(r.pertemuan ?? "").trim()) : []);
    setPertemuanList(perts);
    return perts;
  };

  useEffect(() => {
    loadData();
    loadModul();
  }, []);

  // 🔹 Save (Tambah / Update)
  const save = async (e) => {
    e.preventDefault();

    // cek duplikasi di list sebelum submit
    const exists = list.find(
      (item) =>
        item.mata_kuliah === form.mata_kuliah &&
        item.pertemuan === form.pertemuan &&
        item.halaman === form.halaman &&
        item.id !== editId // abaikan diri sendiri kalau sedang edit
    );

    if (exists) {
      alert("Data dengan Mata Kuliah, Pertemuan, dan Halaman ini sudah ada! Gunakan halaman berbeda.");
      return;
    }


    const fd = new FormData();
    fd.append("mata_kuliah", form.mata_kuliah);
    fd.append("pertemuan", form.pertemuan);
    fd.append("deskripsi", form.deskripsi);
    fd.append("halaman", form.halaman || "");
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
    await loadData();
  };

  // 🔹 Delete
  const del = async (id) => {
    if (!confirm("Hapus isi modul ini?")) return;
    const res = await fetch(`/api/admin/isimodul?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) await loadData();
  };

  // 🔹 Open modal (Tambah atau Edit)
  const openModal = async (m = null) => {
    if (m) {
      setEditId(m.id);
      const res = await fetch(`/api/admin/isimodul?id=${m.id}`, { cache: "no-store" });
      const data = await res.json();
      const oldPert = String(data.pertemuan ?? "").trim();
      const perts = await loadPertemuan(String(data.mata_kuliah ?? "").trim());

      let selectedPert = "";
      if (perts && perts.length) {
        selectedPert = perts.find((p) => p === oldPert) || "";
        if (!selectedPert) {
          selectedPert = perts.find((p) => p.toLowerCase() === oldPert.toLowerCase()) || "";
        }
        if (!selectedPert) {
          selectedPert = perts.find((p) => p.includes(oldPert) || oldPert.includes(p)) || "";
        }
      }

      setForm({
        mata_kuliah: String(data.mata_kuliah ?? "").trim(),
        pertemuan: selectedPert || "",
        deskripsi: data.deskripsi ?? "",
        halaman: data.halaman ?? "",
        gambar: data.gambar ?? null,
      });

      // untuk preview awal
      if (data.gambar) {
        setPreviewUrl(data.gambar); // URL dari server
        setFileName(data.gambar.split("/").pop()); // ambil nama file dari path
      } else {
        setPreviewUrl(null);
        setFileName("");
      }

    } else {
      setEditId(null);
      setForm({
        mata_kuliah: "",
        pertemuan: "",
        deskripsi: "",
        halaman: "",
        gambar: null,
      });
      setPertemuanList([]);
    }
    setShowModal(true);
  };

  // 🔹 Filter list sesuai pilihan dropdown
  const filteredList = list.filter((item) => {
    let match = true;
    if (filterMataKuliah) {
      match = match && item.mata_kuliah === filterMataKuliah;
    }
    if (filterPertemuan) {
      match = match && item.pertemuan === filterPertemuan;
    }
    return match;
  });

  return (
    <div className="relative p-2">
      {/* 🔹 Filter Mata Kuliah & Pertemuan */}
      <div className="flex gap-4 mb-4">
        {/* Dropdown Mata Kuliah */}
        <select
          value={filterMataKuliah}
          onChange={async (e) => {
            const mk = e.target.value;
            setFilterMataKuliah(mk);
            setFilterPertemuan("");
            if (mk) {
              const res = await fetch("/api/admin/pertemuan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mata_kuliah: mk }),
              });
              const data = await res.json();
              setPertemuanOptions(data);
            } else {
              setPertemuanOptions([]);
            }
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Semua Mata Kuliah --</option>
          {[...new Set(modulList.map((mk) => String(mk.mata_kuliah ?? "").trim()))].map((mk, i) => (
            <option key={i} value={mk}>
              {mk}
            </option>
          ))}
        </select>

        {/* Dropdown Pertemuan */}
        <select
          value={filterPertemuan}
          onChange={(e) => setFilterPertemuan(e.target.value)}
          className="border px-3 py-2 rounded"
          disabled={!filterMataKuliah}
        >
          <option value="">-- Semua Pertemuan --</option>
          {pertemuanOptions.map((p) => (
            <option key={p.id} value={p.pertemuan}>
              {p.pertemuan}
            </option>
          ))}
        </select>
      </div>

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
              <th className="border px-3 py-2">Halaman</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list
              .slice() // buat salinan biar tidak merusak state asli
              .sort((a, b) => {
                // 1) Urut mata kuliah (alfabet)
                if (a.mata_kuliah < b.mata_kuliah) return -1;
                if (a.mata_kuliah > b.mata_kuliah) return 1;

                // 2) Urut pertemuan (kalau bisa angka, bandingkan angka)
                const pertA = parseInt(a.pertemuan, 10);
                const pertB = parseInt(b.pertemuan, 10);

                if (!isNaN(pertA) && !isNaN(pertB)) {
                  if (pertA !== pertB) return pertA - pertB;
                } else {
                  // fallback string compare kalau bukan angka
                  if (a.pertemuan < b.pertemuan) return -1;
                  if (a.pertemuan > b.pertemuan) return 1;
                }

                // 3) Urut halaman (angka)
                const halA = parseInt(a.halaman, 10);
                const halB = parseInt(b.halaman, 10);

                if (!isNaN(halA) && !isNaN(halB)) {
                  return halA - halB;
                } else {
                  return String(a.halaman).localeCompare(String(b.halaman));
                }
              })
              .map((m, i) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-1">{i + 1}</td>
                  <td className="border px-3 py-1">{m.mata_kuliah}</td>
                  <td className="border px-3 py-1">{m.pertemuan}</td>
                  <td className="border px-3 py-1">
                    {m.gambar && (
                      <img src={m.gambar} alt="" className="w-16 h-16 object-cover rounded" />
                    )}
                  </td>
                  <td className="border px-3 py-1">{m.deskripsi}</td>
                  <td className="border px-3 py-1">{m.halaman}</td>
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
                onChange={async (e) => {
                  const newMk = e.target.value;
                  setForm((prev) => ({ ...prev, mata_kuliah: newMk, pertemuan: "" }));
                  await loadPertemuan(newMk);
                }}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {[...new Set(modulList.map((mk) => String(mk.mata_kuliah ?? "").trim()))].map(
                  (mk, i) => (
                    <option key={i} value={mk}>
                      {mk}
                    </option>
                  )
                )}
              </select>

              {/* Dropdown Pertemuan */}
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

              {/* Gambar */}
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

              {/* Preview Gambar */}
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  {fileName && (
                    <p className="text-xs text-gray-500 mt-1">File: {fileName}</p>
                  )}
                </div>
              )}


              {/* Deskripsi */}
              <textarea
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                rows={4}
              />

              {/* Dropdown Halaman */}
              <label className="block mb-2">Halaman</label>
              <select
                value={form.halaman}
                onChange={(e) => setForm({ ...form, halaman: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Pilih Halaman --</option>
                {halamanList.map((h, i) => (
                  <option key={i} value={h}>
                    {h}
                  </option>
                ))}
              </select>
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
