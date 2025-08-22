'use client'
import { useEffect, useState } from 'react'

export default function JadwalPage() {
  const [jadwal, setJadwal] = useState({});
  const [selected, setSelected] = useState(null);

  const shifts = ['I', 'II', 'III', 'IV', 'V'];
  const hariKerja = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  // Warna semester
  const semesterColors = {
    1: 'bg-yellow-200',
    2: 'bg-red-200',
    3: 'bg-green-200',
    4: 'bg-blue-200',
    5: 'bg-purple-200',
    6: 'bg-orange-200',
  };

  // Ambil data jadwal dari API
  useEffect(() => {
    fetch('/api/jadwal')
      .then(res => res.json())
      .then(data => setJadwal(data))
      .catch(err => console.error('Gagal fetch jadwal:', err));
  }, []);

  const handleClick = (item) => setSelected(item);
  const handleClose = () => setSelected(null);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
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
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="border p-3 font-semibold text-gray-700">{shift}</td>
                {hariKerja.map((hari, j) => {
                  const item = jadwal[shift]?.[hari] || null;
                  if (!item) return <td key={j} className="border p-3 text-gray-800">-</td>;

                  const bgColor = semesterColors[item.Semester] || 'bg-gray-200';

                  return (
                    <td
                      key={j}
                      className={`border p-3 text-gray-800 font-medium cursor-pointer ${bgColor} hover:brightness-95 transition`}
                      onClick={() => handleClick(item)}
                    >
                      {item.Mata_Kuliah}
                    </td>
                  )
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
            <h2 className="text-xl font-bold mb-4">{selected.Mata_Kuliah}</h2>
            <p><strong>Jurusan:</strong> {selected.Jurusan}</p>
            <p><strong>Kelas:</strong> {selected.Kelas}</p>
            <p><strong>Semester:</strong> {selected.Semester}</p>
            <p><strong>Jam:</strong> {selected.Jam_Mulai} - {selected.Jam_Ahir}</p>
            <p><strong>Assisten:</strong> {selected.Assisten}</p>
            <p><strong>Catatan:</strong> {selected.Catatan || '-'}</p>
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
