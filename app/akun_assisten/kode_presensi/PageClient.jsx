"use client";
import { useEffect, useState } from "react";

export default function PageClient({ user }) {
  // 🧩 STATE UNTUK FORM DAN STATUS
  const [dropdownData, setDropdownData] = useState([]);   // daftar mata kuliah
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(""); // pilihan MK
  const [pertemuan, setPertemuan] = useState("1");
  const [materi, setMateri] = useState("");
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [csrfToken, setCsrfToken] = useState(""); // 🔥 token CSRF dari server

  // ==================== 🔹 1. AMBIL TOKEN CSRF SAAT HALAMAN DIBUKA ====================
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch("/api/csrf", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setCsrfToken(data.token);
          console.log("🟢 CSRF token loaded:", data.token.slice(0, 10) + "...");
        } else {
          console.error("CSRF fetch failed:", data.error);
        }
      } catch (err) {
        console.error("CSRF fetch error:", err);
      }
    };
    fetchCsrf();
  }, []);

  // ==================== 🔹 2. AMBIL DATA DROPDOWN MATA KULIAH ====================
  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const res = await fetch("/api/kode_presensi/dropdown", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setDropdownData(data);
        else console.warn("Gagal ambil data dropdown:", data.error);
      } catch (err) {
        console.error("Dropdown error:", err);
      }
    };
    fetchDropdown();
  }, []);

  // ==================== 🔹 3. KIRIM DATA KE SERVER ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      // 🔐 Kirim token CSRF via header + sertakan cookie via credentials: "include"
      const res = await fetch("/api/kode_presensi", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // ✅ wajib dikirim agar lolos secureHandler
        },
        body: JSON.stringify({
          mata_kuliah_id: selectedMataKuliah,
          pertemuan_ke: pertemuan,
          materi,
          kode,
        }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        setMsg("✅ Kode presensi berhasil dibuat!");
        setMateri("");
        setKode("");
        // 🔁 Arahkan ke halaman status setelah 1 detik
        setTimeout(() => {
          window.location.replace("/akun_assisten/kode_presensi/presensi_status");
        }, 1000);
      } else {
        setMsg("❌ " + (data.error || "Gagal membuat kode"));
      }
    } catch (err) {
      console.error("POST error:", err);
      setMsg("❌ Terjadi error koneksi");
    } finally {
      setLoading(false);
    }
  };

  // ==================== 🔹 4. RENDER TAMPILAN ====================
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Buat Kode Presensi</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >
        {/* Mata Kuliah */}
        <div>
          <label htmlFor="mataKuliah" className="block text-sm font-semibold mb-1">
            Mata Kuliah
          </label>
          <select
            id="mataKuliah"
            name="mataKuliah"
            value={selectedMataKuliah}
            onChange={(e) => setSelectedMataKuliah(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {dropdownData.map((item) => (
              <option key={item.id} value={item.id}>
                {item.mata_kuliah}
              </option>
            ))}
          </select>
        </div>

        {/* Pertemuan */}
        <div>
          <label htmlFor="pertemuan" className="block text-sm font-semibold mb-1">
            Pertemuan
          </label>
          <select
            id="pertemuan"
            name="pertemuan"
            value={pertemuan}
            onChange={(e) => setPertemuan(e.target.value)}
            className="w-full border p-2 rounded"
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
          <label htmlFor="materi" className="block text-sm font-semibold mb-1">
            Materi
          </label>
          <input
            id="materi"
            name="materi"
            type="text"
            className="w-full border p-2 rounded"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            required
          />
        </div>

        {/* Kode Presensi */}
        <div>
          <label htmlFor="kode" className="block text-sm font-semibold mb-1">
            Kode (maks. 5 digit)
          </label>
          <input
            id="kode"
            name="kode"
            type="text"
            maxLength="5"
            className="w-full border p-2 rounded"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            required
          />
        </div>

        {/* Tombol submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Menyimpan..." : "Buat Kode"}
        </button>

        {/* Pesan status */}
        {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
      </form>
    </main>
  );
}
