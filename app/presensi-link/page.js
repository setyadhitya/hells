'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PresensiLinkPage() {
  const params = useSearchParams()
  const matkul = params.get('matkul') || 'Tidak diketahui'
  const [deviceId, setDeviceId] = useState('')
  const [sudahPresensi, setSudahPresensi] = useState(false)
  const [pesan, setPesan] = useState('')
  const [listPresensi, setListPresensi] = useState([])
  const [lokasi, setLokasi] = useState(null)
  const [izinLokasi, setIzinLokasi] = useState(false)

  // Fungsi membuat atau ambil device ID
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
      localStorage.setItem('deviceId', id)
    }
    return id
  }

  useEffect(() => {
    const id = getOrCreateDeviceId()
    setDeviceId(id)

    // Cek apakah sudah pernah presensi untuk matkul ini
    const data = JSON.parse(localStorage.getItem('riwayatPresensi') || '{}')
    if (data[matkul]?.includes(id)) {
      setSudahPresensi(true)
    }

    // Ambil lokasi
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setLokasi({ latitude, longitude })
          setIzinLokasi(true)
        },
        (err) => {
          console.warn('Gagal mendapatkan lokasi:', err.message)
          setIzinLokasi(false)
        }
      )
    }
  }, [matkul])

  const handlePresensi = () => {
    const userAgent = navigator.userAgent
    console.log('Lokasi perangkat:', lokasi)

    // Ambil riwayat
    const riwayat = JSON.parse(localStorage.getItem('riwayatPresensi') || '{}')

    // Tambah deviceId ke matkul
    if (!riwayat[matkul]) {
      riwayat[matkul] = []
    }
    if (!riwayat[matkul].includes(deviceId)) {
      riwayat[matkul].push(deviceId)
    }

    // Simpan kembali
    localStorage.setItem('riwayatPresensi', JSON.stringify(riwayat))

    // Update status
    setSudahPresensi(true)
    setPesan(
      `Terima kasih, perangkat Anda sudah tercatat.${
        lokasi
          ? ` Lokasi: https://maps.google.com/?q=${lokasi.latitude},${lokasi.longitude}`
          : ''
      }`
    )
    setListPresensi(riwayat[matkul])
  }

  return (
    <main className="min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        Presensi: {matkul}
      </h1>

      <button
        onClick={handlePresensi}
        disabled={sudahPresensi}
        className={`px-4 py-2 rounded text-white ${
          sudahPresensi
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {sudahPresensi ? 'Sudah Presensi' : 'Presensi'}
      </button>

      {pesan && <p className="mt-4 text-sm text-green-800">{pesan}</p>}

      {sudahPresensi && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-gray-800">
            Perangkat yang sudah presensi (ID):
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {listPresensi.map((id, i) => (
              <li key={i}>{id}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
