// ✅ FILE: app/tabel/page.js (Frontend Tabel Mingguan)
"use client";
import React, { useEffect, useState } from 'react';

const jamList = {
  senin: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  selasa: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  rabu: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  kamis: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  jumat: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30"]
};

function jamRange(start, end, jamArray) {
  const hasil = [];
  let mulai = false;
  for (let jam of jamArray) {
    if (jam === start) mulai = true;
    if (mulai) hasil.push(jam);
    if (jam === end) break;
  }
  return hasil;
}

function formatJam(jam) {
  const [hh, mm] = jam.split(":");
  return `${hh}.${mm}`;
}

export default function Tabel() {
  const [jadwal, setJadwal] = useState({});

  useEffect(() => {
    fetch("/api/jadwal")
      .then(res => res.json())
      .then(data => {
        const mapping = {};
        for (let item of data) {
          const hari = item.Hari.toLowerCase();
          const jamArray = jamList[hari] || [];
          const jamStart = formatJam(item.Jam_Mulai);
          const jamEnd = formatJam(item.Jam_Ahir);
          const jamDipakai = jamRange(jamStart, jamEnd, jamArray);
          if (!mapping[hari]) mapping[hari] = [];
          mapping[hari].push(...jamDipakai);
        }
        for (let h in mapping) {
          mapping[h] = [...new Set(mapping[h])];
        }
        setJadwal(mapping);
      });
  }, []);

  const hariList = Object.keys(jamList);

  return (
    <table className="table-auto border-collapse border text-sm w-full">
      <thead>
        <tr>
          <th className="border p-2 w-20 text-center bg-gray-200">Hari</th>
          <th className="border p-2 text-center bg-gray-200" colSpan={18}>Jam</th>
        </tr>
        <tr>
          <td></td>
          {jamList.senin.map((jam, i) => (
            <th key={i} className="border p-1 text-xs bg-gray-100">{jam}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {hariList.map((hari, idx) => (
          <tr key={idx}>
            <td className="border p-2 font-semibold capitalize text-center bg-gray-50">{hari}</td>
            {jamList[hari].map((jam, jdx) => {
              const isBooked = jadwal[hari]?.includes(jam);
              return (
                <td
                  key={jdx}
                  className={`border p-1 text-center ${isBooked ? 'bg-red-500 text-white' : 'bg-green-100'}`}
                >
                  {isBooked ? 'X' : ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}