//app/regler-admin-pengaturan/praktikum/PraktikumClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // ✅ harus diimport

export default function PraktikumClient({ user }) {
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
    jam_mulai: "",
    jam_ahir: "",
    shift: "",
    shift_Select: "",
    assisten: "",
    catatan: "",
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
    const body = editId ? { ...form, id: editId } : form;

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
    const res = await fetch(`/api/admin/praktikum?id=${id}`, {
  method: "DELETE",
  credentials: "include",
});

    if (res.ok) location.reload();
  };

  const openModal = (p = null) => {
    if (p) {
      setEditId(p.id);

      setForm({
        ...p,
       mata_kuliah_Select: daftarMataKuliah.includes(p.mata_kuliah)
          ? p.mata_kuliah
          : "Lainnya",
       mata_kuliah: p.mata_kuliah,
        jurusan_Select: daftarjurusan.includes(p.jurusan)
          ? p.jurusan
          : "Lainnya",
        jurusan: p.jurusan,
        kelas_Select: daftarkelas.includes(p.kelas)
          ? p.kelas
          : "Lainnya",
        kelas: p.kelas,
        semester_Select: daftarsemester.includes(p.semester)
          ? p.semester
          : "Lainnya",
        semester: p.semester,
        shift_Select: daftarshift[p.shift]
          ? p.shift : "Lainnya",
        shift: p.shift,
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

  const handleLogout = async () => {
    await fetch("/../api/auth/logout", {
      method: "POST",
    })
    router.push("/regler-admin-pengaturan/login")
  }

  return (
    <main className="max-w-2xl mx-auto py-10">
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

      <div className="w-full mt-4">
  <table className="w-full mt-4 border border-gray-300 text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Mata Kuliah</th>
              <th className="border px-3 py-2">jurusan</th>
              <th className="border px-3 py-2">kelas</th>
              <th className="border px-3 py-2">semester</th>
              <th className="border px-3 py-2">Hari</th>
              <th className="border px-3 py-2">Jam</th>
              <th className="border px-3 py-2">shift</th>
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
                 mata_kuliah_Select: val,
                 mata_kuliah: val === "Lainnya" ? "" : val,
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
                  setForm({ ...form,mata_kuliah: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* Dropdown jurusan */}
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
              <option value="">Pilih jurusan</option>
              {daftarjurusan.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>

            {form.jurusan_Select === "Lainnya" && (
              <input
                placeholder="jurusan Lainnya"
                value={form.jurusan}
                onChange={(e) =>
                  setForm({ ...form, jurusan: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* Dropdown kelas */}
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
              <option value="">Pilih kelas</option>
              {daftarkelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>

            {form.kelas_Select === "Lainnya" && (
              <input
                placeholder="kelas Lainnya"
                value={form.kelas}
                onChange={(e) =>
                  setForm({ ...form, kelas: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}

            {/* Dropdown semester */}
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
              <option value="">Pilih semester</option>
              {daftarsemester.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>

            {form.semester_Select === "Lainnya" && (
              <input
                placeholder="semester Lainnya"
                value={form.semester}
                onChange={(e) =>
                  setForm({ ...form, semester: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}




            {/* Dropdown hari */}
            <select
              value={form.hari}
              onChange={(e) =>
                setForm({
                  ...form,
                  hari_Select: e.target.value,
                  hari: e.target.value === "Lainnya" ? "" : e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih hari</option>
              {daftarhari.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>

            {form.hari_Select === "Lainnya" && (
              <input
                placeholder="hari Lainnya"
                value={form.hari}
                onChange={(e) =>
                  setForm({ ...form, hari: e.target.value })
                }
                className="w-full border px-3 py-2 rounded mb-2"
              />
            )}




            {/* Dropdown shift */}
            <select
              value={form.shift}
              onChange={(e) => {
                const val = e.target.value;
                setForm({
                  ...form,
                  shift: val,
                  jam_mulai: daftarshift[val]?.jam_mulai || "",
                  jam_ahir: daftarshift[val]?.jam_ahir || "",
                });
              }}
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Pilih shift</option>
              {Object.keys(daftarshift).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Input Assisten */}
            <input
              placeholder="Nama Assisten"
              value={form.assisten}
              onChange={(e) => setForm({ ...form, assisten: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            {/* Input jamotomatis */}
            <div className="flex gap-2">
              <input
                value={form.jam_mulai}
                readOnly
                className="w-1/2 border px-3 py-2 rounded bg-gray-100"
              />
              <input
                value={form.jam_ahir}
                readOnly
                className="w-1/2 border px-3 py-2 rounded bg-gray-100"
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
    </main>
  );
}
