'use client'
import { useEffect, useState } from 'react'

const months = [
  "Agustus", "September", "Oktober", "November", "Desember",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli"
];

const getMonthNumber = (monthIndex) => (monthIndex + 7) % 12;

export default function Calendar() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // Agustus
  const [selectedDate, setSelectedDate] = useState(null);
  const [jadwal, setJadwal] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const yearOptions = Array.from({ length: 10 }, (_, i) => 2025 + i);
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

  const openModal = async (day) => {
    const realMonth = getMonthNumber(selectedMonthIndex);
    const d = new Date(selectedYear, realMonth, day);
    const tanggalStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(tanggalStr);
    setShowModal(true);
    const res = await fetch(`/api/kalender?tanggal=${tanggalStr}`);
    const data = await res.json();
    setJadwal(data);
  };

  const closeModal = () => {
    setShowModal(false);
    setJadwal([]);
    setSelectedDate(null);
  };

  const renderCalendarCells = () => {
    const realMonth = getMonthNumber(selectedMonthIndex);
    const daysInMonth = getDaysInMonth(selectedYear, realMonth);
    const firstDay = getFirstDay(selectedYear, realMonth);

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="border p-2" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, realMonth, d);
      const dayOfWeek = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const cellClass = `border p-2 text-center cursor-pointer hover:bg-blue-100 ${isWeekend ? 'text-red-500 font-semibold' : ''
        }`;

      cells.push(
        <div
          key={d}
          className={cellClass}
          onClick={() => openModal(d)}
        >
          {d}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="max-w-md w-full mx-auto p-4 bg-white shadow rounded-lg flex flex-col gap-4 overflow-auto h-full">
        {/* Dropdown tahun dan bulan */}
        <div className="flex justify-between">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border p-1 rounded"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonthIndex}
            onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value))}
            className="border p-1 rounded"
          >
            {months.map((month, i) => (
              <option key={month} value={i}>{month}</option>
            ))}
          </select>
        </div>

        {/* Header hari */}
        <div className="grid grid-cols-7 text-center font-semibold">
          {daysOfWeek.map((day, i) => (
            <div
              key={day}
              className={`border p-2 ${i === 0 || i === 6 ? 'text-red-500 bg-red-50' : 'bg-gray-100'}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-7 flex-grow overflow-y-auto">
          {renderCalendarCells()}
        </div>
      </div>

      {/* Modal popup */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg transition-all duration-300 ease-in-out animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >


            <h2 className="text-xl font-bold mb-4">Jadwal Praktikum {selectedDate}</h2>
            {jadwal.length === 0 ? (
              <p className="text-gray-500">Tidak ada jadwal.</p>
            ) : (
              <ul className="space-y-3">
                {jadwal.map((item, index) => (
                  <li key={index} className="border rounded p-2">
                    <p><strong>{item.Mata_Kuliah}</strong> ({item.Jurusan})</p>
                    <p>{item.Jam_mulai} - {item.Jam_ahir} (Shift {item.Shift})</p>
                    <p>Asisten: {item.Assisten}</p>
                    {item.Catatan && <p className="italic text-sm text-gray-600">{item.Catatan}</p>}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
