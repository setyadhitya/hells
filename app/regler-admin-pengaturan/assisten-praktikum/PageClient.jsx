"use client";

import { useState, useEffect } from "react";

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

export default function AssistenPraktikumClient({ user }) {
  const [list, setList] = useState([]);
  const [assistenList, setAssistenList] = useState([]);
  const [praktikumList, setPraktikumList] = useState([]);
  const [form, setForm] = useState({
    assisten_id: "",
    praktikum_id: "",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Ambil daftar relasi Asisten - Praktikum
  const fetchRelations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assisten-praktikum", {
        credentials: "include",
      });
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Gagal ambil relasi:", err);
      setList([]);
      setErrorMsg("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ambil daftar asisten
  const fetchAssistens = async () => {
    try {
      const res = await fetch("/api/admin/assisten", { credentials: "include" });
      const data = await res.json();
      setAssistenList(data);
    } catch (err) {
      console.error("Gagal ambil asisten:", err);
    }
  };

  // 🔹 Ambil daftar praktikum
  const fetchPraktikum = async () => {
    try {
      const res = await fetch("/api/admin/praktikum?mode=dropdown", {
        credentials: "include",
      });
      const data = await res.json();
      setPraktikumList(data);
    } catch (err) {
      console.error("Gagal ambil praktikum:", err);
    }
  };

  useEffect(() => {
    fetchRelations();
    fetchAssistens();
    fetchPraktikum();
  }, []);

  // 🔹 Simpan (POST / PUT)
  const save = async (e) => {
    e.preventDefault();

    if (!form.assisten_id || !form.praktikum_id) {
      alert("Asisten dan Praktikum wajib dipilih.");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const payload = {
      id: editId,
      assisten_id: form.assisten_id,
      praktikum_id: form.praktikum_id,
    };

    const res = await fetch("/api/admin/assisten-praktikum", {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": getCookie("csrf_token"),
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Gagal menyimpan data");
      return;
    }

    alert(result.message || "Relasi berhasil disimpan");
    setShowModal(false);
    setEditId(null);
    setForm({ assisten_id: "", praktikum_id: "" });
    fetchRelations();
  };

  // 🔹 Hapus
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus relasi ini?")) return;
    const res = await fetch(`/api/admin/assisten-praktikum?id=${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "x-csrf-token": getCookie("csrf_token") },
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Gagal menghapus relasi");
      return;
    }
    alert(result.message || "Relasi berhasil dihapus");
    fetchRelations();
  };

  // 🔹 Modal tambah/edit
  const openModal = (r = null) => {
    if (r) {
      setEditId(r.id);
      setForm({
        assisten_id: r.assisten_id || "",
        praktikum_id: r.praktikum_id || "",
      });
    } else {
      setEditId(null);
      setForm({ assisten_id: "", praktikum_id: "" });
    }
    setShowModal(true);
  };

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-3">Asisten - Praktikum</h1>

      <button
        onClick={() => openModal()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tambah Relasi
      </button>

      {loading ? (
        <p className="mt-4 text-gray-500">Memuat data...</p>
      ) : errorMsg ? (
        <p className="mt-4 text-red-500">{errorMsg}</p>
      ) : (
        <table className="w-full mt-4 border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-1">Asisten</th>
              <th className="border px-3 py-1">Praktikum</th>
              <th className="border px-3 py-1">Kelas</th>
              <th className="border px-3 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td className="border px-3 py-1">{r.assisten}</td>
                <td className="border px-3 py-1">{r.praktikum}</td>
                <td className="border px-3 py-1">{r.kelas}</td>
                <td className="border px-3 py-1 space-x-2">
                  <button
                    onClick={() => openModal(r)}
                    className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <form
            onSubmit={save}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Edit Relasi" : "Tambah Relasi"}
            </h3>

            <select
              value={form.assisten_id}
              onChange={(e) =>
                setForm({ ...form, assisten_id: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            >
              <option value="">-- Pilih Asisten --</option>
              {assistenList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama}
                </option>
              ))}
            </select>

            <select
              value={form.praktikum_id}
              onChange={(e) =>
                setForm({ ...form, praktikum_id: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            >
              <option value="">-- Pilih Praktikum --</option>
              {praktikumList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.mata_kuliah} ({p.kelas})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
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
