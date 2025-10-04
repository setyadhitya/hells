"use client";

import { useEffect, useState } from "react";

export default function PageClient({ user }) {
  const [dropdownData, setDropdownData] = useState([]); 
  const [selectedMataKuliah, setSelectedMataKuliah] = useState("");
  const [pertemuan, setPertemuan] = useState("1");
  const [materi, setMateri] = useState("");
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  console.log("User dari props:", user);

  // 🔹 Ambil data dropdown
  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const res = await fetch("/api/kode_presensi/dropdown");
        if (res.ok) {
          const data = await res.json();
          console.log("Dropdown data:", data);
          setDropdownData(data || []);
        } else {
          console.error("Gagal ambil data dropdown");
          setDropdownData([]);
        }
      } catch (err) {
        console.error("Error fetch dropdown:", err);
        setDropdownData([]);
      }
    };

    fetchDropdown();
  }, []);

  // 🔹 Kirim data ke API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/kode_presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mata_kuliah_id: selectedMataKuliah,
          pertemuan_ke: pertemuan,
          materi,
          kode,
          generated_by_assisten_id: user?.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("✅ Kode presensi berhasil dibuat!");
        setMateri("");
        setKode("");

        // ⏳ Tunggu 1 detik agar pesan muncul dulu
        setTimeout(() => {
          // 🔁 Redirect ke halaman status
          window.location.replace("/kode_presensi/presensi_status");
        }, 1000);
      } else {
        setMsg("❌ " + (data.error || "Gagal membuat kode"));
      }
    } catch (err) {
      console.error("Error POST:", err);
      setMsg("❌ Terjadi error server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Buat Kode Presensi</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white shadow p-6 rounded-lg"
      >
        {/* Dropdown Mata Kuliah */}
        <div>
          <label className="block text-sm font-medium">Mata Kuliah</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedMataKuliah}
            onChange={(e) => setSelectedMataKuliah(e.target.value)}
            required
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {Array.isArray(dropdownData) &&
              dropdownData.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.mata_kuliah}
                </option>
              ))}
          </select>
        </div>

        {/* Dropdown Pertemuan */}
        <div>
          <label className="block text-sm font-medium">Pertemuan</label>
          <select
            className="w-full border p-2 rounded"
            value={pertemuan}
            onChange={(e) => setPertemuan(e.target.value)}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Pertemuan {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Materi */}
        <div>
          <label className="block text-sm font-medium">Materi</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            required
          />
        </div>

        {/* Kode */}
        <div>
          <label className="block text-sm font-medium">
            Kode (maks 5 digit)
          </label>
          <input
            type="text"
            maxLength="5"
            className="w-full border p-2 rounded"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Menyimpan..." : "Buat Kode"}
        </button>

        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </form>
    </main>
  );
}
