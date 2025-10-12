// app/akun_assisten/beri_tugas/PageClient.jsx
"use client";
import { useEffect, useState } from "react";

export default function PageClient({ user }) {
  const [mataKuliah, setMataKuliah] = useState([]); // daftar praktikum
  const [form, setForm] = useState({
    praktikum_id: "",
    pertemuan: "",
    tugas: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ==================== 🔹 AMBIL DROPDOWN MATA KULIAH ====================
  useEffect(() => {
    const fetchMataKuliah = async () => {
      try {
        const res = await fetch("/api/akun_assisten/dropdown");
        const data = await res.json();
        if (res.ok) setMataKuliah(data.matkul);
        else console.warn("Dropdown gagal:", data.error);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
      }
    };
    fetchMataKuliah();
  }, []);

  // ==================== 🔹 HANDLE PERUBAHAN INPUT ====================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ==================== 🔹 SUBMIT DATA FORM ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("praktikum_id", form.praktikum_id);
    formData.append("pertemuan", form.pertemuan);
    formData.append("tugas", form.tugas);
    if (form.file) formData.append("file", form.file);

    try {
      const res = await fetch("/api/akun_assisten/tugas/beri_tugas", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Tugas berhasil disimpan!");
        setForm({ praktikum_id: "", pertemuan: "", tugas: "", file: null });

        // Redirect ke halaman utama setelah 2 detik
        setTimeout(() => {
          window.location.href = "/akun_assisten";
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Gagal menyimpan tugas (koneksi error)");
    } finally {
      setLoading(false);
    }
  };

  // ==================== 🔹 RENDER HALAMAN ====================
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Beri Tugas</h1>

      {message && (
        <p className="mb-4 text-center font-semibold text-green-600">{message}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        {/* Dropdown Mata Kuliah */}
        <div>
          <label htmlFor="praktikum_id" className="block font-semibold mb-1">
            Mata Kuliah
          </label>
          <select
            id="praktikum_id"
            name="praktikum_id"
            value={form.praktikum_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {mataKuliah.map((mk) => (
              <option key={mk.id} value={mk.id}>
                {mk.mata_kuliah}
              </option>
            ))}
          </select>
        </div>

        {/* Pertemuan */}
        <div>
          <label htmlFor="pertemuan" className="block font-semibold mb-1">
            Pertemuan
          </label>
          <select
            id="pertemuan"
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

        {/* Deskripsi Tugas */}
        <div>
          <label htmlFor="tugas" className="block font-semibold mb-1">
            Deskripsi Tugas
          </label>
          <textarea
            id="tugas"
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
          <label htmlFor="file" className="block font-semibold mb-1">
            File (opsional)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            onChange={handleChange}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maksimal 256 KB | Format: jpg, png, docx, pdf, rar, dll
          </p>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Menyimpan..." : "Simpan Tugas"}
        </button>
      </form>
    </main>
  );
}
