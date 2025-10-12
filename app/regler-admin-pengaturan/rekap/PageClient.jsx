"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function RekapPage({ user }) {
  const [praktikumList, setPraktikumList] = useState([]);
  const [selectedPraktikum, setSelectedPraktikum] = useState("");
  const [rekap, setRekap] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ambil daftar praktikum untuk dropdown
  const fetchPraktikum = async () => {
    const res = await fetch("/api/admin/praktikum?mode=dropdown", { credentials: "include" });
    const data = await res.json();
    setPraktikumList(data);
  };

  // Ambil data rekap presensi dari API
  const fetchRekap = async (praktikumId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rekap?praktikum_id=${praktikumId}`, { credentials: "include" });
      const data = await res.json();
      setRekap(data);
    } catch (err) {
      console.error("Gagal ambil rekap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPraktikum();
  }, []);
// ==========================================
  // 🔹 Export PDF Function
  // ==========================================
  const exportPDF = () => {
  if (!rekap) return alert("Pilih praktikum terlebih dahulu.");

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Rekap Presensi Praktikum", 14, 15);

  // Info header
  doc.setFontSize(10);
  doc.text(`Jurusan: ${rekap.info.jurusan}`, 14, 25);
  doc.text(`Shift: ${rekap.info.shift}`, 14, 30);
  doc.text(`Jam: ${rekap.info.jam}`, 14, 35);
  doc.text(
    `Tanggal Pelaksanaan: ${rekap.info.tanggal_awal} s/d ${rekap.info.tanggal_akhir}`,
    14,
    40
  );

  // === Tabel 1 ===
  doc.text("Tabel 1 – Rekap Praktikan", 14, 50);
  autoTable(doc, {
    startY: 55,
    head: [["Nama", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Total"]],
    body: rekap.tabel1.map((p) => [
      p.nama_praktikan,
      ...Array(10).fill("-"),
      p.total_hadir,
    ]),
    styles: { fontSize: 8 },
    theme: "grid",
  });

  // === Tabel 2 ===
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.text("Tabel 2 – Daftar Pertemuan", 14, finalY);
  autoTable(doc, {
    startY: finalY + 5,
    head: [["Pertemuan", "Lokasi", "Tanggal"]],
    body: rekap.tabel2.map((r) => [r.pertemuan_ke, r.lokasi, r.tanggal]),
    styles: { fontSize: 8 },
    theme: "grid",
  });

  // === Tabel 3 ===
  finalY = doc.lastAutoTable.finalY + 10;
  doc.text("Tabel 3 – Asisten Praktikum", 14, finalY);
  autoTable(doc, {
    startY: finalY + 5,
    head: [["Nama", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Total"]],
    body: rekap.tabel3.map((a) => [
      a.nama,
      ...Array(10).fill("-"),
      "-",
    ]),
    styles: { fontSize: 8 },
    theme: "grid",
  });

  doc.save(`Rekap_Presensi_${rekap.info.jurusan}_${rekap.info.shift}.pdf`);
};


  // ==========================================

  return (
    <main className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Rekap Presensi</h1>

      <div className="bg-white p-4 rounded border mb-6 shadow">
        <label className="block font-medium mb-1">Nama Praktikum</label>
        <select
          value={selectedPraktikum}
          onChange={(e) => {
            setSelectedPraktikum(e.target.value);
            if (e.target.value) fetchRekap(e.target.value);
          }}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="">-- Pilih Praktikum --</option>
          {praktikumList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.mata_kuliah} ({p.kelas})
            </option>
          ))}
        </select>

        {rekap && (
          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <p><strong>Jurusan:</strong> {rekap.info.jurusan}</p>
            <p><strong>Semester:</strong> {rekap.info.semester}</p>
            <p><strong>Shift:</strong> {rekap.info.shift}</p>
            <p><strong>Jam:</strong> {rekap.info.jam}</p>
            <p>
              <strong>Tanggal Pelaksanaan:</strong> {rekap.info.tanggal_awal} – {rekap.info.tanggal_akhir}
            </p>
          </div>
        )}


        
      {rekap && (
        <button
          onClick={exportPDF}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          📄 Export PDF
        </button>
      )}

      {loading && <p className="text-gray-500">Memuat data rekap...</p>}
      </div>

      {loading && <p className="text-gray-500">Memuat data rekap...</p>}

      {/* Tabel 1 */}
      {rekap && (
        <>
          <h2 className="text-lg font-semibold mb-2">Tabel 1 – Rekap Praktikan</h2>
          <table className="w-full border border-gray-300 text-sm mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Nama</th>
                {[...Array(10)].map((_, i) => (
                  <th key={i} className="border px-2 py-1">{i + 1}</th>
                ))}
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {rekap.tabel1.map((p) => (
                <tr key={p.praktikan_id}>
                  <td className="border px-2 py-1">{p.nama_praktikan}</td>
                  {[...Array(10)].map((_, i) => (
                    <td key={i} className="border px-2 py-1 text-center">-</td>
                  ))}
                  <td className="border px-2 py-1 text-center font-semibold">{p.total_hadir}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabel 2 */}
          <h2 className="text-lg font-semibold mb-2">Tabel 2 – Daftar Pertemuan</h2>
          <table className="w-full border border-gray-300 text-sm mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Pertemuan</th>
                <th className="border px-2 py-1">Lokasi</th>
                <th className="border px-2 py-1">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {rekap.tabel2.map((r) => (
                <tr key={r.pertemuan_ke}>
                  <td className="border px-2 py-1 text-center">{r.pertemuan_ke}</td>
                  <td className="border px-2 py-1 text-center">{r.lokasi}</td>
                  <td className="border px-2 py-1 text-center">{r.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabel 3 */}
          <h2 className="text-lg font-semibold mb-2">Tabel 3 – Asisten Praktikum</h2>
          <table className="w-full border border-gray-300 text-sm mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Nama</th>
                {[...Array(10)].map((_, i) => (
                  <th key={i} className="border px-2 py-1">{i + 1}</th>
                ))}
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {rekap.tabel3.map((a) => (
                <tr key={a.assisten_id}>
                  <td className="border px-2 py-1">{a.nama}</td>
                  {[...Array(10)].map((_, i) => (
                    <td key={i} className="border px-2 py-1 text-center">-</td>
                  ))}
                  <td className="border px-2 py-1 text-center">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
