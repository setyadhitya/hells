"use client";
import { useState, useEffect } from "react";

export default function PageClient({ user }) {
  const [tugasList, setTugasList] = useState([]);
  const [form, setForm] = useState({
    praktikum_id: "",
    pertemuan: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(null); // ✅ apakah praktikan terdaftar

  // 🔹 Cek apakah praktikan sudah terdaftar di praktikum
  useEffect(() => {
    const checkPeserta = async () => {
      try {
        const res = await fetch("/api/peserta/check", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.registered) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      } catch (err) {
        console.error("Check peserta error:", err);
        setAllowed(false);
      }
    };
    checkPeserta();
  }, []);

  // 🔹 Ambil daftar tugas dari tb_beritugas
  useEffect(() => {
    if (!allowed) return; // 🔒 hanya ambil data jika sudah terdaftar
    const fetchTugas = async () => {
      try {
        const res = await fetch("/api/akun/kumpul_tugas/list", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setTugasList(data);
        else console.warn("Gagal ambil daftar tugas:", data.error);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTugas();
  }, [allowed]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("praktikan_id", user.id);
      formData.append("praktikum_id", form.praktikum_id);
      formData.append("pertemuan", form.pertemuan);
      if (form.file) formData.append("file", form.file);

      const res = await fetch("/api/akun/kumpul_tugas", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ Tugas berhasil dikumpulkan!");
        setForm({ praktikum_id: "", pertemuan: "", file: null });
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengumpulkan tugas");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Jika masih memeriksa status
  if (allowed === null) {
    return (
      <main className="min-h-screen flex justify-center items-center text-gray-600">
        Memeriksa status keanggotaan praktikum...
      </main>
    );
  }

  // 🔹 Jika belum terdaftar di praktikum
  if (!allowed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-md max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Tidak Terdaftar di Praktikum
          </h1>
          <p className="text-gray-600 mb-4">
            Kamu belum terdaftar sebagai peserta pada praktikum mana pun.
          </p>
          <p className="text-gray-500 text-sm">
            Silakan hubungi admin atau dosen untuk menambahkan kamu ke daftar peserta praktikum.
          </p>

          <button
            onClick={() => (window.location.href = "/akun_praktikan")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </main>
    );
  }

  // 🔹 Jika sudah terdaftar, tampilkan form normal
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">📘 Kumpul Tugas</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow border border-gray-200"
      >
        {/* Dropdown Mata Kuliah */}
        <div>
          <label className="block font-semibold mb-1">Mata Kuliah</label>
          <select
            name="praktikum_id"
            value={form.praktikum_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {tugasList.map((t) => (
              <option key={t.id} value={t.praktikum_id}>
                {t.mata_kuliah}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Pertemuan */}
        <div>
          <label className="block font-semibold mb-1">Pertemuan</label>
          <select
            name="pertemuan"
            value={form.pertemuan}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Pertemuan --</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Pertemuan {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Upload File */}
        <div>
          <label className="block font-semibold mb-1">File</label>
          <input type="file" name="file" onChange={handleChange} className="w-full" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          {loading ? "Mengirim..." : "Kirim Tugas"}
        </button>
      </form>
    </main>
  );
}
