//app/jadwal/page.js
'use client';
import { useEffect, useState } from 'react';

export default function JadwalPage() {
  const [jadwal, setJadwal] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const shifts = ['Shift I', 'Shift II', 'Shift III', 'Shift IV', 'Shift V'];
  const hariKerja = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const semesterColors = {
    1: 'bg-yellow-200',
    2: 'bg-red-200',
    3: 'bg-green-200',
    4: 'bg-blue-200',
    5: 'bg-purple-200',
    6: 'bg-orange-200',
  };

  useEffect(() => {
    fetch('/api/jadwal')
      .then(res => res.json())
      .then(data => setJadwal(data))
      .catch(err => console.error('Gagal fetch jadwal:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (item) => setSelected(item);
  const handleClose = () => setSelected(null);

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600">Memuat jadwal...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-gray-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Jadwal Praktikum</h1>

      {/* Legend warna semester */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {Object.entries(semesterColors).map(([sem, color]) => (
          <div key={sem} className="flex items-center gap-2">
            <div className={`${color} w-6 h-6 border rounded-sm`}></div>
            <span className="font-medium text-gray-700">Semester {sem}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <thead className="bg-gray-800 text-white text-lg">
            <tr>
              <th className="border p-4">Shift</th>
              {hariKerja.map((h, i) => (
                <th key={i} className="border p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border p-3 font-semibold text-gray-700">{shift}</td>
                {hariKerja.map((hari, j) => {
                  const item = jadwal?.[shift]?.[hari] || null;
                  if (!item) return <td key={j} className="border p-3 text-gray-400 text-center">–</td>;

                  const bgColor = semesterColors[item.semester] || 'bg-gray-200';

                  return (
                    <td
                      key={j}
                      className={`border p-3 text-gray-800 font-medium cursor-pointer ${bgColor} hover:brightness-95 transition`}
                      onClick={() => handleClick(item)}
                    >
                      {item.mata_kuliah}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 transition-opacity duration-300"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-96 p-6 relative transform transition-transform duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{selected.mata_kuliah}</h2>
            <p><strong>Jurusan:</strong> {selected.jurusan}</p>
            <p><strong>Kelas:</strong> {selected.kelas}</p>
            <p><strong>Semester:</strong> {selected.semester}</p>
            <p><strong>Jam:</strong> {selected.jam_mulai} - {selected.jam_ahir}</p>
            <p><strong>Assisten:</strong></p>
            <div className="max-h-24 overflow-y-auto border p-2 rounded text-sm mb-2">
              {selected.daftar_assisten
                ? selected.daftar_assisten
                  .split(",")
                  .map((nama, i) => (
                    <p key={i}>{i + 1}. {nama.trim()}{i === selected.daftar_assisten.split(",").length - 1 ? "." : ","}</p>
                  ))
                : "-"}
            </div>
            <p><strong>Peserta:</strong> {selected.peserta || '-'}</p>
            <p><strong>Nama Peserta:</strong></p>
            <div className="max-h-32 overflow-y-auto border p-2 rounded text-sm">
              {selected.daftar_peserta
                ? selected.daftar_peserta
                  .split(",") // Pisahkan berdasarkan koma
                  .map((nama, i) => (
                    <p key={i}>{i + 1}. {nama.trim()}{i === selected.daftar_peserta.split(",").length - 1 ? "." : ","}</p>
                  ))
                : "-"}
            </div>

            <p><strong>Catatan:</strong> {selected.catatan || '-'}</p>

            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
