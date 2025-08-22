'use client'

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'

const dataPresensi = [
    { matkul: 'Jaringan Komputer 1', jamMulai: '08:00', jamSelesai: '10:00' },
    { matkul: 'Keamanan Jaringan', jamMulai: '20:00', jamSelesai: '23:00' },
    { matkul: 'Praktikum Routing', jamMulai: '13:00', jamSelesai: '15:00' },
];

function isWaktuAktif(jamMulai, jamSelesai) {
    const now = new Date();
    const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    };
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= toMinutes(jamMulai) && nowMinutes <= toMinutes(jamSelesai);
}

export default function PresensiPage() {
    const [popup, setPopup] = useState('');
    const [qrLink, setQrLink] = useState('');

    const handleClick = (matkul, aktif) => {
        if (aktif) {
            const encodedMatkul = encodeURIComponent(matkul);
            const host = "http://60.23.77.142:3000";
            const link = `${host}/presensi-link?matkul=${encodedMatkul}`;
            setQrLink(link);
        } else {
            setPopup(`Belum waktunya presensi untuk ${matkul}`);
            setTimeout(() => setPopup(''), 3000);
        }
    };

    return (
        <main className="min-h-screen bg-white p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Presensi Praktikum</h1>
            <div className="space-y-4">
                {dataPresensi.map((item, i) => {
                    const aktif = isWaktuAktif(item.jamMulai, item.jamSelesai);
                    return (
                        <button
                            key={i}
                            onClick={() => handleClick(item.matkul, aktif)}
                            className={`w-full p-4 rounded-lg border text-left font-medium transition duration-200 ${aktif
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {item.matkul} ({item.jamMulai} - {item.jamSelesai})
                        </button>
                    );
                })}

                {qrLink && (
                    <div className="mt-6 p-4 border rounded bg-gray-50">
                        <p className="mb-2 text-gray-700">Scan QR berikut untuk melakukan presensi:</p>
                        <QRCodeCanvas value={qrLink} size={180} />
                        <p className="text-xs mt-2 text-gray-400">{qrLink}</p>
                    </div>
                )}

                {popup && <div className="text-red-600 font-semibold mt-4">{popup}</div>}
            </div>
        </main>
    );
}
