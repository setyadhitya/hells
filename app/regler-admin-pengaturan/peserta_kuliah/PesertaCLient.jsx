"use client";
import { useEffect, useState } from "react";

export default function PesertaClient({ user }) {
  const [list, setList] = useState([]);
  const [dropdown, setDropdown] = useState({ praktikan: [], matkul: [] });
  const [mataKuliahId, setMataKuliahId] = useState("");
  const [praktikanList, setPraktikanList] = useState([{ praktikan_id: "" }]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await fetch("/api/admin/peserta_kuliah", { cache: "no-store" });
    const data = await res.json();
    setList(data);
  };

  const loadDropdown = async () => {
    const res = await fetch("/api/admin/peserta_kuliah/dropdown", { cache: "no-store" });
    const data = await res.json();
    setDropdown(data);
  };

  useEffect(() => {
    loadData();
    loadDropdown();
  }, []);

  const addPraktikanField = () => {
    setPraktikanList([...praktikanList, { praktikan_id: "" }]);
  };

  const removePraktikanField = (index) => {
    const newList = [...praktikanList];
    newList.splice(index, 1);
    setPraktikanList(newList);
  };

  const handleChange = (index, value) => {
    const newList = [...praktikanList];
    newList[index].praktikan_id = value;
    setPraktikanList(newList);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!mataKuliahId) return alert("Pilih mata kuliah dulu");

    const body = praktikanList.map((p) => ({
      praktikan_id: p.praktikan_id,
      mata_kuliah_id: mataKuliahId,
    }));

    const res = await fetch("/api/admin/peserta_kuliah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok || result.error) return alert(result.error);
    alert("Peserta berhasil ditambahkan");
    setShowModal(false);
    loadData();
  };

  const del = async (id) => {
    if (!confirm("Hapus peserta ini?")) return;
    const res = await fetch(`/api/admin/peserta_kuliah?id=${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  };

  return (
    <div className="relative p-2">
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tambah Peserta
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Nama Praktikan</th>
              <th className="border px-3 py-2">Mata Kuliah</th>
              <th className="border px-3 py-2">Tanggal</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{i + 1}</td>
                <td className="border px-3 py-1">{item.praktikan}</td>
                <td className="border px-3 py-1">{item.mata_kuliah}</td>
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

            {/* Dropdown Mata Kuliah */}
            <select
              value={mataKuliahId}
              onChange={(e) => setMataKuliahId(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
              required
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {dropdown.matkul.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.mata_kuliah}
                </option>
              ))}
            </select>

            {/* Multi Praktikan */}
            {praktikanList.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={p.praktikan_id}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                  required
                >
                  <option value="">-- Pilih Praktikan --</option>
                  {dropdown.praktikan.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nama}
                    </option>
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
  );
}
