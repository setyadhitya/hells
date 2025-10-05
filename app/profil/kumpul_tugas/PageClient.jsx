"use client"
import { useState, useEffect } from "react";

export default function Clientpage({ user }) {
  const [tugasList, setTugasList] = useState([]);
  const [form, setForm] = useState({
    praktikum_id: "",
    pertemuan: "",
    file: null
  });
  const [loading, setLoading] = useState(false);

  // Ambil daftar tugas dari tb_beritugas
  useEffect(() => {
    const fetchTugas = async () => {
      try {
        const res = await fetch("/api/akun_assisten/tugas/list"); // API list tugas
        const data = await res.json();
        setTugasList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTugas();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("praktikan_id", user.id); // id mahasiswa
      formData.append("praktikum_id", form.praktikum_id);
      formData.append("pertemuan", form.pertemuan);
      if (form.file) formData.append("file", form.file);

      const res = await fetch("/api/akun/kumpul_tugas", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        alert("Tugas berhasil dikumpulkan!");
        setForm({ praktikum_id: "", pertemuan: "", file: null });
      } else {
        alert(data.error); // misal: "Anda bukan peserta mata kuliah ini"
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengumpulkan tugas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Kumpul Tugas</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
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
                {t.mata_kuliah} {/* tampil nama mata kuliah */}
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
