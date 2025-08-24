"use client";
import { useState, useEffect } from "react";

export default function HalamanPage() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ id: null, modul_id: "", nomor_halaman: "", isi: "" });
  const [isEdit, setIsEdit] = useState(false);

  // Load Data
  const loadData = async () => {
    const res = await fetch("/regler-admin-pengaturan/api/halaman");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit (Add/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await fetch(`/regler-admin-pengaturan/api/halaman/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/regler-admin-pengaturan/api/halaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ id: null, modul_id: "", nomor_halaman: "", isi: "" });
    setIsEdit(false);
    loadData();
  };

  // Edit
  const handleEdit = (row) => {
    setForm(row);
    setIsEdit(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    await fetch(`/regler-admin-pengaturan/api/halaman/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manajemen Halaman Modul</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          name="modul_id"
          placeholder="Modul ID"
          value={form.modul_id}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          name="nomor_halaman"
          placeholder="Nomor Halaman"
          value={form.nomor_halaman}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <textarea
          name="isi"
          placeholder="Isi Halaman"
          value={form.isi}
          onChange={handleChange}
          className="border p-2 w-full"
          rows="3"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEdit ? "Update" : "Tambah"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Modul ID</th>
            <th className="border px-2 py-1">Nomor Halaman</th>
            <th className="border px-2 py-1">Isi</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td className="border px-2 py-1">{row.id}</td>
              <td className="border px-2 py-1">{row.modul_id}</td>
              <td className="border px-2 py-1">{row.nomor_halaman}</td>
              <td className="border px-2 py-1">{row.isi}</td>
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => handleEdit(row)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(row.id)} className="bg-red-600 text-white px-2 py-1 rounded">
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
