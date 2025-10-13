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
  const [noData, setNoData] = useState(false); // 🔹 kalau belum punya data praktikum

  // ==================== 🔹 AMBIL DROPDOWN MATA KULIAH ====================
  useEffect(() => {
    const fetchMataKuliah = async () => {
      try {
        const res = await fetch("/api/akun_assisten/dropdown", {
          credentials: "include",
        });
        const data = await res.json();

        // Kalau data kosong → tampilkan pesan
        if (res.ok && data.matkul && data.matkul.length > 0) {
          setMataKuliah(data.matkul);
        } else {
          setNoData(true);
        }
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        setNoData(true);
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

  // ==================== 🔹 TAMPILAN KALAU BELUM ADA PRAKTIKUM ====================
  if (noData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-md max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Tidak Ada Praktikum
          </h1>
          <p className="text-gray-600 mb-4">
            Kamu belum terdaftar mengampu praktikum apa pun.
          </p>
          <p className="text-gray-500 text-sm">
            Silakan hubungi admin untuk menambahkan kamu ke daftar asisten praktikum.
          </p>

          <button
            onClick={() => (window.location.href = "/akun_assisten")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </main>
    );
  }

  // ==================== 🔹 FORM NORMAL ====================
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">🧾 Beri Tugas</h1>

      {message && (
        <p
          className={`mb-4 text-center font-semibold ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200"
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
