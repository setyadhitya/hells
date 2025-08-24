"use client";
import { useState, useEffect } from "react";

export default function ModulPage() {
  const [moduls, setModuls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ id: "", judul: "", deskripsi: "" });

  // Fetch data
  const fetchModul = async () => {
    const res = await fetch("/regler-admin-pengaturan/api/modul");
    const data = await res.json();
    setModuls(data);
  };

  useEffect(() => {
    fetchModul();
  }, []);

  // Open modal tambah
  const openTambah = () => {
    setIsEdit(false);
    setFormData({ id: "", judul: "", deskripsi: "" });
    setShowModal(true);
  };

  // Open modal edit
  const openEdit = (modul) => {
    setIsEdit(true);
    setFormData(modul);
    setShowModal(true);
  };

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simpan data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await fetch(`/regler-admin-pengaturan/api/modul/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch("/regler-admin-pengaturan/api/modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setShowModal(false);
    fetchModul();
  };

  // Hapus data
  const handleDelete = async (id) => {
    if (confirm("Yakin hapus modul ini?")) {
      await fetch(`/regler-admin-pengaturan/api/modul/${id}`, {
        method: "DELETE",
      });
      fetchModul();
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Daftar Modul</h1>
          <button
            onClick={openTambah}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            + Tambah Modul
          </button>
        </div>

        {/* Tabel modul */}
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Judul</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {moduls.map((m) => (
              <tr key={m.id}>
                <td className="border p-2 text-center">{m.id}</td>
                <td className="border p-2">{m.judul}</td>
                <td className="border p-2">{m.deskripsi}</td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">
              {isEdit ? "Edit Modul" : "Tambah Modul"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Judul</label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
