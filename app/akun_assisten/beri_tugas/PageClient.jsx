"use client"
import { useEffect, useState } from "react";

export default function PageClient() {
  const [mataKuliah, setMataKuliah] = useState([]);
  const [form, setForm] = useState({
    praktikum_id: "",
    pertemuan: "",
    tugas: "",
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Ambil dropdown mata kuliah
  useEffect(() => {
    const fetchMataKuliah = async () => {
      try {
        const res = await fetch("/api/akun_assisten/dropdown");
        const data = await res.json();
        setMataKuliah(data.matkul); // ambil array matkul
      } catch (err) {
        console.error(err);
      }
    };
    fetchMataKuliah();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("praktikum_id", form.praktikum_id);
    formData.append("pertemuan", form.pertemuan);
    formData.append("tugas", form.tugas);
    if (form.file) formData.append("file", form.file);

    try {
      const res = await fetch("/api/akun_assisten/tugas/beri_tugas", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Tugas berhasil disimpan!");
        setForm({ praktikum_id: "", pertemuan: "", tugas: "", file: null });

        // jeda 2 detik sebelum redirect
        setTimeout(() => {
          window.location.href = "/akun_assisten";
        }, 2000);
      } else {
        setSuccess(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setSuccess("Gagal menyimpan tugas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Beri Tugas</h1>
      {success && <p className="mb-4 text-center text-green-600 font-semibold">{success}</p>}

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
            {mataKuliah.map(mk => (
              <option key={mk.id} value={mk.id}>
                {mk.mata_kuliah}
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
              <option key={i+1} value={i+1}>Pertemuan {i+1}</option>
            ))}
          </select>
        </div>

        {/* Tugas */}
        <div>
          <label className="block font-semibold mb-1">Deskripsi Tugas</label>
          <textarea
            name="tugas"
            value={form.tugas}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Upload File */}
        <div>
          <label className="block font-semibold mb-1">File (opsional)</label>
          <input type="file" name="file" onChange={handleChange} className="w-full" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          {loading ? "Menyimpan..." : "Simpan Tugas"}
        </button>
      </form>
    </main>
  );
}
