"use client";
import { useEffect, useState } from "react";

export default function PageClient({ user }) {
  // 🧩 STATE UTAMA
  const [dropdownData, setDropdownData] = useState([]);   // daftar MK dari API
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(""); 
  const [pertemuan, setPertemuan] = useState("1");
  const [materi, setMateri] = useState("");
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [csrfToken, setCsrfToken] = useState(""); 
  const [noData, setNoData] = useState(false); // 🔹 jika asisten belum punya data praktikum

  // ==================== 🔹 1. AMBIL TOKEN CSRF ====================
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch("/api/csrf", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setCsrfToken(data.token);
        else console.warn("CSRF fetch failed:", data.error);
      } catch (err) {
        console.error("CSRF fetch error:", err);
      }
    };
    fetchCsrf();
  }, []);

  // ==================== 🔹 2. AMBIL DATA DROPDOWN (MATA KULIAH ASISTEN) ====================
  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const res = await fetch("/api/kode_presensi/dropdown", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          if (data.length === 0) {
            setNoData(true); // 🚫 Tidak ada data praktikum
          } else {
            setDropdownData(data);
          }
        } else {
          console.warn("Gagal ambil data dropdown:", data.error);
          setNoData(true);
        }
      } catch (err) {
        console.error("Dropdown error:", err);
        setNoData(true);
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
      // Ambil lokasi GPS asisten
      const lokasi = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject("Browser tidak mendukung geolocation");
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
          (err) => reject("Gagal ambil lokasi: " + err.message)
        );
      });

      const res = await fetch("/api/kode_presensi", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          praktikum_id: selectedMataKuliah,
          pertemuan_ke: pertemuan,
          materi,
          kode,
          lokasi, // ✅ lokasi dikirim ke server
        }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        setMsg("✅ Kode presensi berhasil dibuat!");
        setMateri("");
        setKode("");
        setTimeout(() => {
          window.location.replace("/akun_assisten/kode_presensi/presensi_status");
        }, 1000);
      } else {
        setMsg("❌ " + (data.error || "Gagal membuat kode"));
      }
    } catch (err) {
      console.error("POST error:", err);
      setMsg("❌ " + err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 🔹 4. TAMPILAN HALAMAN ====================
  if (noData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-md max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tidak Ada Praktikum</h1>
          <p className="text-gray-600 mb-4">
            Kamu belum terdaftar sebagai asisten pada praktikum mana pun.
          </p>
          <p className="text-gray-500 text-sm">
            Silakan hubungi admin untuk menambahkan kamu ke daftar asisten praktikum.
          </p>
        </div>
      </main>
    );
  }

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
