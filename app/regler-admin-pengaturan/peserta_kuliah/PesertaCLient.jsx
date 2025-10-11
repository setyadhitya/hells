"use client";
import { useEffect, useState } from "react";

export default function PesertaClient({ user }) {
  const [list, setList] = useState([]);
  const [dropdown, setDropdown] = useState({ praktikan: [], praktikum: [] });
  const [praktikumId, setPraktikumId] = useState("");
  const [praktikanList, setPraktikanList] = useState([{ praktikan_id: "" }]);
  const [showModal, setShowModal] = useState(false);

  // Load daftar peserta
  const loadData = async () => {
    const res = await fetch("/api/admin/peserta_kuliah", { cache: "no-store" });
    const data = await res.json();
    setList(data);
  };

  // Load dropdown praktikan & praktikum
  const loadDropdown = async () => {
    const res = await fetch("/api/admin/peserta_kuliah/dropdown", { cache: "no-store" });
    const data = await res.json();
    setDropdown(data);
  };

  useEffect(() => {
    loadData();
    loadDropdown();
  }, []);

  // Tambah / hapus field praktikan
  const addPraktikanField = () => setPraktikanList([...praktikanList, { praktikan_id: "" }]);
  const removePraktikanField = (index) => {
    const newList = [...praktikanList];
    newList.splice(index, 1);
    setPraktikanList(newList);
  };

  const handlePraktikanChange = (index, value) => {
    const newList = [...praktikanList];
    newList[index].praktikan_id = value;
    setPraktikanList(newList);
  };

  // Simpan peserta
  const save = async (e) => {
    e.preventDefault();
    if (!praktikumId) return alert("Pilih praktikum dulu");

    const body = praktikanList.map((p) => ({
      praktikan_id: p.praktikan_id,
      praktikum_id: praktikumId,
    }));

    try {
      const res = await fetch("/api/admin/peserta_kuliah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok || result.error) return alert(result.error);
      alert("Peserta berhasil ditambahkan");
      setShowModal(false);
      setPraktikumId("");
      setPraktikanList([{ praktikan_id: "" }]);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan peserta");
    }
  };

  const del = async (id) => {
    if (!confirm("Hapus peserta ini?")) return;
    const res = await fetch(`/api/admin/peserta_kuliah?id=${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  };

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Daftar Peserta Kuliah</h1>
      <p className="text-gray-600 mt-2">
        Halo, {user?.username} — role: {user?.role}
      </p>
    <div className="relative p-2">
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tambah Peserta
      </button>

      <div className="overflow-x-auto">
        <table className="w-full mt-4 border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Nama Praktikan</th>
              <th className="border px-3 py-2">Praktikum</th>
              <th className="border px-3 py-2">Tanggal</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{i + 1}</td>
                <td className="border px-3 py-1">{item.praktikan}</td>
                <td className="border px-3 py-1">{item.praktikum}</td>
                <td className="border px-3 py-1">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="border px-3 py-1 space-x-1">
                  <button
                    onClick={() => del(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Peserta */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <form
            onSubmit={save}
            className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">Tambah Peserta Kuliah</h3>

            {/* Dropdown Praktikum */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Praktikum</label>
              <select
                value={praktikumId}
                onChange={(e) => setPraktikumId(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">-- Pilih Praktikum --</option>
                {dropdown.praktikum.map((p) => (
                  <option key={p.id} value={p.id}>{p.mata_kuliah}</option>
                ))}
              </select>
            </div>

            {/* Multi Praktikan */}
            {praktikanList.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={p.praktikan_id}
                  onChange={(e) => handlePraktikanChange(i, e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                  required
                >
                  <option value="">-- Pilih Praktikan --</option>
                  {dropdown.praktikan.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.nama}</option>
                  ))}
                </select>
                {praktikanList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePraktikanField(i)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    -
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addPraktikanField}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
            >
              + Tambah Praktikan
            </button>

            <div className="flex justify-end gap-2">
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
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </main>
  );
}
