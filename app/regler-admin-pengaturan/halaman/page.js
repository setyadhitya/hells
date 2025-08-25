"use client";
import { useEffect, useState } from "react";

export default function HalamanPage() {
  const [data, setData] = useState([]);
  const [moduls, setModuls] = useState([]);
  const [form, setForm] = useState({
    id: null,
    modul_id: "",
    nomor_halaman: "",
    isi: "",
  });

  // ambil data halaman
  const fetchData = async () => {
    const res = await fetch("/regler-admin-pengaturan/api/halaman");
    const json = await res.json();
    setData(json);
  };

  // ambil data modul untuk dropdown
  const fetchModuls = async () => {
    const res = await fetch("/regler-admin-pengaturan/api/modul");
    const json = await res.json();
    setModuls(json);
  };

  useEffect(() => {
    fetchData();
    fetchModuls();
  }, []);

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.id) {
      // UPDATE
      await fetch(`/regler-admin-pengaturan/api/halaman/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modul_id: form.modul_id,
          nomor_halaman: form.nomor_halaman,
          isi: form.isi,
        }),
      });
    } else {
      // INSERT
      await fetch("/regler-admin-pengaturan/api/halaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modul_id: form.modul_id,
          nomor_halaman: form.nomor_halaman,
          isi: form.isi,
        }),
      });
    }

    setForm({ id: null, modul_id: "", nomor_halaman: "", isi: "" });
    fetchData();
  };

  // isi form saat edit
  const handleEdit = (row) => {
    setForm({
      id: row.id,
      modul_id: row.modul_id,
      nomor_halaman: row.nomor_halaman,
      isi: row.isi,
    });
  };

  // hapus halaman
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus halaman ini?")) return;
    await fetch(`/regler-admin-pengaturan/api/halaman/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manajemen Halaman Modul</h1>

      {/* form tambah / edit halaman */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <select
          className="border p-2 rounded w-full"
          value={form.modul_id}
          onChange={(e) => setForm({ ...form, modul_id: e.target.value })}
          required
        >
          <option value="">-- Pilih Modul --</option>
          {moduls.map((m) => (
            <option key={m.id} value={m.id}>
              {m.judul}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Nomor Halaman"
          className="border p-2 rounded w-full"
          value={form.nomor_halaman}
          onChange={(e) => setForm({ ...form, nomor_halaman: e.target.value })}
          required
        />

        <textarea
          placeholder="Isi Halaman"
          className="border p-2 rounded w-full"
          value={form.isi}
          onChange={(e) => setForm({ ...form, isi: e.target.value })}
        ></textarea>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {form.id ? "Update" : "Tambah"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={() =>
              setForm({ id: null, modul_id: "", nomor_halaman: "", isi: "" })
            }
            className="bg-gray-400 text-white px-4 py-2 rounded ml-2"
          >
            Batal
          </button>
        )}
      </form>

      {/* tabel halaman */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Modul</th>
            <th className="border p-2">Nomor</th>
            <th className="border p-2">Isi</th>
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.id}</td>
              <td className="border p-2">{row.modul_id}</td>
              <td className="border p-2">{row.nomor_halaman}</td>
              <td className="border p-2">{row.isi}</td>
              <td className="border p-2">
                {new Date(row.created_at).toLocaleString()}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
