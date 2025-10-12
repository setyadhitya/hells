"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // ✅ untuk navigasi jika dibutuhkan

// 🧩 Helper untuk mengambil cookie, digunakan untuk CSRF token
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

export default function PraktikumClient({ user }) {
  // 🔹 Daftar opsi tetap
  const daftarMataKuliah = [
    "Pengantar Teknologi Informasi",
    "Basis Data",
    "Struktur Data dan Algoritma",
    "Pemrograman Berorientasi Objek",
    "Web Programing",
    "Pemrograman Klirnt-Server",
    "Sistem Operasi",
    "Jaringan Komputer",
  ];

  const daftarjurusan = ["Resiskom", "Informatika", "Statistika"];
  const daftarkelas = ["A", "K"];
  const daftarsemester = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const daftarhari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const daftarshift = {
    "shift I": { jam_mulai: "07:30", jam_ahir: "10:30" },
    "shift II": { jam_mulai: "10:30", jam_ahir: "13:30" },
    "shift III": { jam_mulai: "13:30", jam_ahir: "16:30" },
    "shift IV": { jam_mulai: "16:30", jam_ahir: "19:30" },
    "shift V": { jam_mulai: "19:30", jam_ahir: "22:30" },
  };

  // 🔹 State
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    mata_kuliah: "",
    mata_kuliah_Select: "",
    jurusan: "",
    jurusan_Select: "",
    kelas: "",
    kelas_Select: "",
    semester: "",
    semester_Select: "",
    hari: "",
    hari_Select: "",
    jam_mulai: "",
    jam_ahir: "",
    shift: "",
    shift_Select: "",
    assisten: "",
    catatan: "",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // 🧩 loading saat fetch data
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Ambil data dari API
  const fetchPraktikum = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/praktikum", {
        credentials: "include", // 🧩 kirim cookie untuk session
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengambil data praktikum");
      }
      const data = await res.json();
      setList(data);
      setErrorMsg("");
    } catch (err) {
      console.error("Fetch praktikum error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPraktikum();
  }, []);

  // 🔹 Simpan data (POST / PUT)
  const save = async (e) => {
    e.preventDefault();

    // 🧩 Validasi field wajib
    if (
      !form.mata_kuliah?.trim() ||
      !form.jurusan?.trim() ||
      !form.kelas?.trim() ||
      !form.semester?.trim() ||
      !form.hari?.trim() ||
      !form.shift?.trim()
    ) {
      alert("Semua field wajib diisi.");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const payload = editId ? { ...form, id: editId } : form;

    try {
      const res = await fetch("/api/admin/praktikum", {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCookie("csrf_token"), // 🧩 CSRF token
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.error) {
        console.error("Save failed:", result);
        alert(result.error || result.message || "Terjadi kesalahan saat menyimpan");
        return;
      }

      alert(result.message || "Berhasil disimpan");
      setShowModal(false);
      setEditId(null);
      setForm({
        mata_kuliah: "",
        mata_kuliah_Select: "",
        jurusan: "",
        jurusan_Select: "",
        kelas: "",
        kelas_Select: "",
        semester: "",
        semester_Select: "",
        hari: "",
        hari_Select: "",
        jam_mulai: "",
        jam_ahir: "",
        shift: "",
        shift_Select: "",
        assisten: "",
        catatan: "",
      });
      fetchPraktikum(); // refresh data
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan jaringan");
    }
  };

  // 🔹 Hapus data
  const del = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      const res = await fetch(`/api/admin/praktikum?id=${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": getCookie("csrf_token"),
        },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(result.error || result.message || "Gagal menghapus");
        return;
      }
      alert(result.message || "Berhasil dihapus");
      fetchPraktikum(); // refresh data
    } catch (err) {
      console.error("Delete error:", err);
      alert("Terjadi kesalahan jaringan");
    }
  };

  // 🔹 Modal tambah/edit
  const openModal = (p = null) => {
    if (p) {
      setEditId(p.id);
      setForm({
        ...p,
        mata_kuliah_Select: daftarMataKuliah.includes(p.mata_kuliah)
          ? p.mata_kuliah
          : "Lainnya",
        jurusan_Select: daftarjurusan.includes(p.jurusan) ? p.jurusan : "Lainnya",
        kelas_Select: daftarkelas.includes(p.kelas) ? p.kelas : "Lainnya",
        semester_Select: daftarsemester.includes(p.semester) ? p.semester : "Lainnya",
        shift_Select: daftarshift[p.shift] ? p.shift : "Lainnya",
      });
    } else {
      setEditId(null);
      setForm({
        mata_kuliah: "",
        mata_kuliah_Select: "",
        jurusan: "",
        jurusan_Select: "",
        kelas: "",
        kelas_Select: "",
        semester: "",
        semester_Select: "",
        hari: "",
        hari_Select: "",
        jam_mulai: "",
        jam_ahir: "",
        shift: "",
        shift_Select: "",
        assisten: "",
        catatan: "",
      });
    }
    setShowModal(true);
  };

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Praktikum</h1>
      <p className="mt-2 text-gray-700">
        Halo, {user.username} — role: {user.role}
      </p>

      {/* 🔹 Tombol tambah praktikum */}
      {(user.role === "admin" || user.role === "laboran") && (
        <button
          onClick={() => openModal()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tambah Praktikum
        </button>
      )}

      {/* 🔹 Tabel daftar praktikum */}
      {loading ? (
        <p className="mt-4 text-gray-500">Memuat data...</p>
      ) : errorMsg ? (
        <p className="mt-4 text-red-500">{errorMsg}</p>
      ) : (
        <div className="w-full mt-4">
          <table className="w-full mt-4 border border-gray-300 text-sm">
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
                <th className="border px-3 py-2">Assisten</th>
                <th className="border px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-1">{p.id}</td>
                  <td className="border px-3 py-1">{p.mata_kuliah}</td>
                  <td className="border px-3 py-1">{p.jurusan}</td>
                  <td className="border px-3 py-1">{p.kelas}</td>
                  <td className="border px-3 py-1">{p.semester}</td>
                  <td className="border px-3 py-1">{p.hari}</td>
                  <td className="border px-3 py-1">
                    {p.jam_mulai} - {p.jam_ahir}
                  </td>
                  <td className="border px-3 py-1">{p.shift}</td>
                  <td className="border px-3 py-1">{p.assisten}</td>
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
                          onClick={() => del(p.id)}
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
      )}

      {/* 🔹 Modal */}
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

            {/* 🔹 Dropdown Mata Kuliah */}
            <select
              value={form.mata_kuliah_Select}
              onChange={(e) => {
                const val = e.target.value;
                setForm({
                  ...form,
                  mata_kuliah_Select: val,
                  mata_kuliah: val === "Lainnya" ? "" : val,
                });
              }}
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Mata Kuliah</option>
              {daftarMataKuliah.map((mk) => (
                <option key={mk} value={mk}>{mk}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {form.mata_kuliah_Select === "Lainnya" && (
              <input
                placeholder="Mata Kuliah Lainnya"
                value={form.mata_kuliah}
                onChange={(e) =>
                  setForm({ ...form, mata_kuliah: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* 🔹 Dropdown Jurusan */}
            <select
              value={form.jurusan_Select}
              onChange={(e) =>
                setForm({
                  ...form,
                  jurusan_Select: e.target.value,
                  jurusan: e.target.value === "Lainnya" ? "" : e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Jurusan</option>
              {daftarjurusan.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {form.jurusan_Select === "Lainnya" && (
              <input
                placeholder="Jurusan Lainnya"
                value={form.jurusan}
                onChange={(e) =>
                  setForm({ ...form, jurusan: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* 🔹 Dropdown Kelas */}
            <select
              value={form.kelas_Select}
              onChange={(e) =>
                setForm({
                  ...form,
                  kelas_Select: e.target.value,
                  kelas: e.target.value === "Lainnya" ? "" : e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Kelas</option>
              {daftarkelas.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {form.kelas_Select === "Lainnya" && (
              <input
                placeholder="Kelas Lainnya"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* 🔹 Dropdown Semester */}
            <select
              value={form.semester_Select}
              onChange={(e) =>
                setForm({
                  ...form,
                  semester_Select: e.target.value,
                  semester: e.target.value === "Lainnya" ? "" : e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Semester</option>
              {daftarsemester.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {form.semester_Select === "Lainnya" && (
              <input
                placeholder="Semester Lainnya"
                value={form.semester}
                onChange={(e) =>
                  setForm({ ...form, semester: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* 🔹 Dropdown Hari */}
            <select
              value={form.hari_Select}
              onChange={(e) =>
                setForm({
                  ...form,
                  hari_Select: e.target.value,
                  hari: e.target.value === "Lainnya" ? "" : e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Hari</option>
              {daftarhari.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {form.hari_Select === "Lainnya" && (
              <input
                placeholder="Hari Lainnya"
                value={form.hari}
                onChange={(e) => setForm({ ...form, hari: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* 🔹 Dropdown Shift */}
            <select
              value={form.shift_Select}
              onChange={(e) => {
                const val = e.target.value;
                setForm({
                  ...form,
                  shift_Select: val,
                  shift: val === "Lainnya" ? "" : val,
                  jam_mulai: daftarshift[val]?.jam_mulai || "",
                  jam_ahir: daftarshift[val]?.jam_ahir || "",
                });
              }}
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih Shift</option>
              {Object.keys(daftarshift).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {form.shift_Select === "Lainnya" && (
              <>
                <input
                  placeholder="Shift Lainnya"
                  value={form.shift}
                  onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
                <input
                  placeholder="Jam Mulai"
                  type="time"
                  value={form.jam_mulai}
                  onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
                <input
                  placeholder="Jam Akhir"
                  type="time"
                  value={form.jam_ahir}
                  onChange={(e) => setForm({ ...form, jam_ahir: e.target.value })}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
              </>
            )}

            {/* 🔹 Assisten */}
            <input
              placeholder="Assisten"
              value={form.assisten}
              onChange={(e) => setForm({ ...form, assisten: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            {/* 🔹 Catatan */}
            <textarea
              placeholder="Catatan"
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            {/* 🔹 Tombol Submit & Batal */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 rounded text-white hover:bg-green-600"
              >
                {editId ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
