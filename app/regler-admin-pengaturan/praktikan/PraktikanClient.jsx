"use client";

import { useState, useEffect } from "react";

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

export default function PraktikanClient({ user }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    username: "",
    nim: "",
    nomorhp: "",
    password: "",
    status: "Aktif",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil data
  const fetchPraktikans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/praktikan", { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengambil data praktikan");
      }
      const data = await res.json();
      setList(data);
      setErrorMsg("");
    } catch (err) {
      console.error("Fetch praktikan error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPraktikans();
  }, []);

  // Simpan (POST / PUT)
  const save = async (e) => {
    e.preventDefault();

    if (!form.nama?.trim() || !form.username?.trim() || (!editId && !form.password)) {
      alert("Nama, username, dan password (saat tambah) wajib diisi.");
      return;
    }

    const method = editId ? "PUT" : "POST";

    // 🧩 Pastikan role & status tidak kosong
    const safeRole = form.role && form.role.trim() !== "" ? form.role : "Praktikan";
    const safeStatus = form.status && form.status.trim() !== "" ? form.status : "Aktif";

    const payload = editId
      ? {
        id: editId,
        nama: form.nama,
        username: form.username,
        nim: form.nim,
        nomorhp: form.nomorhp,
        password: form.password,
        role: safeRole,
        status: safeStatus,
      }
      : {
        nama: form.nama,
        username: form.username,
        nim: form.nim,
        nomorhp: form.nomorhp,
        password: form.password,
        role: "Praktikan",
        status: "Aktif",
      };

    console.log("🧩 Payload:", payload);

    try {
      const res = await fetch("/api/admin/praktikan", {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCookie("csrf_token"),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Save failed:", result);
        alert(result.error || result.message || "Terjadi kesalahan saat menyimpan");
        return;
      }

      alert(result.message || "Berhasil disimpan");
      setShowModal(false);
      setEditId(null);
      setForm({
        nama: "",
        username: "",
        nim: "",
        nomorhp: "",
        password: "",
        role: "Praktikan",
        status: "Aktif",
      });
      fetchPraktikans();
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan jaringan");
    }
  };


  // Hapus
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`/api/admin/praktikan?id=${id}`, {
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
      fetchPraktikans();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Terjadi kesalahan jaringan");
    }
  };

  // Modal tambah/edit
  const openModal = (a = null) => {
    if (a) {
      setEditId(a.id);
      setForm({
        nama: a.nama || "",
        username: a.username || "",
        nim: a.nim || "",
        nomorhp: a.nomorhp || "",
        password: "",
        status: a.status || "Aktif",
      });
    } else {
      setEditId(null);
      setForm({
        nama: "",
        username: "",
        nim: "",
        nomorhp: "",
        password: "",
        status: "Aktif",
      });
    }
    setShowModal(true);
  };

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Daftar Praktikan</h1>
      <p className="text-gray-600 mt-2">
        Halo, {user?.username} — role: {user?.role}
      </p>

      {(user?.role === "admin" || user?.role === "laboran") && (
        <button
          onClick={() => openModal()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tambah Praktikan
        </button>
      )}
            <p className="text-gray-600 mt-2">
tombol ini untuk penambahan manual, request akun dari mahasiswa sendiri lewat daftar pada login mahasiswa</p>
      {loading ? (
        <p className="mt-4 text-gray-500">Memuat data...</p>
      ) : errorMsg ? (
        <p className="mt-4 text-red-500">{errorMsg}</p>
      ) : (
        <table className="w-full mt-4 border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-1">ID</th>
              <th className="border px-3 py-1">Nama</th>
              <th className="border px-3 py-1">Username</th>
              <th className="border px-3 py-1">Role</th>
              <th className="border px-3 py-1">Status</th>
              <th className="border px-3 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{a.id}</td>
                <td className="border px-3 py-1">{a.nama}</td>
                <td className="border px-3 py-1">{a.username}</td>
                <td className="border px-3 py-1">{a.role}</td>
                <td className={`border px-3 py-1 font-semibold ${a.status === "Aktif" ? "text-green-600" : "text-red-500"}`}>
                  {a.status}
                </td>
                <td className="border px-3 py-1 space-x-2">
                  {(user?.role === "admin" || user?.role === "laboran") && (
                    <>
                      <button
                        onClick={() => openModal(a)}
                        className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </>
                  )}
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={save}
            className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Edit Praktikan" : "Tambah Praktikan"}
            </h3>

            <input
              type="text"
              placeholder="Nama Lengkap"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
              required
            />

            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
              required
            />

            <input
              type="text"
              placeholder="NIM"
              value={form.nim}
              onChange={(e) => setForm({ ...form, nim: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="text"
              placeholder="Nomor HP"
              value={form.nomorhp}
              onChange={(e) => setForm({ ...form, nomorhp: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="password"
              placeholder={editId ? "Ganti Password (opsional)" : "Password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
              required={!editId}
            />

            {editId && (
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-3"
              >
                <option value="Aktif">Aktif</option>
                <option value="nonaktif">nonaktif</option>
              </select>
            )}

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
