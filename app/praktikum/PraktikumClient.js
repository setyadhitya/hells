"use client";

import { useState } from "react";

export default function PraktikumClient({ data, user }) {
  const [list, setList] = useState(data);
  const [form, setForm] = useState({
    Mata_Kuliah: "",
    Jurusan: "",
    Jurusan_Lainnya: "",
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

  const shiftTimes = {
    I: { start: "07:30", end: "10:30" },
    II: { start: "10:30", end: "13:30" },
    III: { start: "13:30", end: "16:30" },
    IV: { start: "16:30", end: "19:30" },
    V: { start: "19:30", end: "22:30" },
  };

  const daysMap = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
  };

  // Tambah / Update
  const save = async (e) => {
    e.preventDefault();

    // Validasi tanggal sesuai hari
    if (form.Hari && form.Tanggal_Mulai) {
      const chosenDay = new Date(form.Tanggal_Mulai).getDay(); // Minggu=0, Senin=1, dst
      if (chosenDay !== daysMap[form.Hari]) {
        alert(`Tanggal tidak sesuai dengan hari ${form.Hari}`);
        return;
      }
    }

    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, ID: editId } : form;

    const res = await fetch("/api/praktikum", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });


    const result = await res.json();

    if (!res.ok || result.error) {
      // 🔥 Tampilkan peringatan validasi dari backend
      alert(result.error || "Terjadi kesalahan");
      return;
    }

    // Kalau sukses, tutup modal & refresh
    setShowModal(false);
    location.reload();
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
        Jurusan_Lainnya: "",
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
                <td className="border px-3 py-1">
                  {p.Jurusan === "Lainnya" ? p.Jurusan_Lainnya : p.Jurusan}
                </td>
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
              {/* Mata Kuliah */}
              <input
                placeholder="Mata Kuliah"
                value={form.Mata_Kuliah}
                onChange={(e) =>
                  setForm({ ...form, Mata_Kuliah: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* Jurusan */}
              <select
                value={form.Jurusan}
                onChange={(e) =>
                  setForm({ ...form, Jurusan: e.target.value, Jurusan_Lainnya: "" })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Pilih Jurusan</option>
                <option value="Resiskom">Resiskom</option>
                <option value="Informatika">Informatika</option>
                <option value="Statistika">Statistika</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {form.Jurusan === "Lainnya" && (
                <input
                  placeholder="Jurusan Lainnya"
                  value={form.Jurusan_Lainnya}
                  onChange={(e) =>
                    setForm({ ...form, Jurusan_Lainnya: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              )}

              {/* Kelas */}
              <select
                value={form.Kelas}
                onChange={(e) => setForm({ ...form, Kelas: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Pilih Kelas</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>

              {/* Semester */}
              <select
                value={form.Semester}
                onChange={(e) => setForm({ ...form, Semester: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Pilih Semester</option>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Hari */}
              <select
                value={form.Hari}
                onChange={(e) => setForm({ ...form, Hari: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Pilih Hari</option>
                {Object.keys(daysMap).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Shift */}
              <select
                value={form.Shift}
                onChange={(e) => {
                  const shift = e.target.value;
                  setForm({
                    ...form,
                    Shift: shift,
                    Jam_Mulai: shiftTimes[shift]?.start || "",
                    Jam_Ahir: shiftTimes[shift]?.end || "",
                  });
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Pilih Shift</option>
                {Object.keys(shiftTimes).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Jam otomatis tampil readonly */}
              <div className="flex gap-2">
                <input
                  type="time"
                  value={form.Jam_Mulai}
                  readOnly
                  className="w-1/2 border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  type="time"
                  value={form.Jam_Ahir}
                  readOnly
                  className="w-1/2 border px-3 py-2 rounded bg-gray-100"
                />
              </div>

              {/* Asisten */}
              <input
                placeholder="Asisten"
                value={form.Assisten}
                onChange={(e) => setForm({ ...form, Assisten: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Catatan */}
              <input
                placeholder="Catatan"
                value={form.Catatan}
                onChange={(e) => setForm({ ...form, Catatan: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Tanggal */}
              <input
                type="date"
                value={form.Tanggal_Mulai}
                onChange={(e) =>
                  setForm({ ...form, Tanggal_Mulai: e.target.value })
                }
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
