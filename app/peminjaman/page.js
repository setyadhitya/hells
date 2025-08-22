'use client'

import { useEffect, useState } from 'react'
import Tabel from '../tabel/page'

const akunDummy = {
  nama: "Andi Mahasiswa",
  nim: "1234567890"
}

const semuaJam = {
  senin: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  selasa: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  rabu: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  kamis: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30", "15.00", "15.30", "16.00"],
  jumat: ["07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30", "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00", "14.30"]
}

// Konversi dari "08:30:00" ke "08.30"
function formatJam(jam) {
  const [hh, mm] = jam.split(":")
  return `${hh}.${mm}`
}

function jamToIndex(jam) {
  return semuaJam["senin"].indexOf(jam)
}

function getRentangJam(jamMulai, jamSelesai, hari) {
  const semua = semuaJam[hari]
  const idxMulai = semua.indexOf(jamMulai)
  const idxSelesai = semua.indexOf(jamSelesai)
  return semua.slice(idxMulai, idxSelesai + 1)
}

function namaHariDariTanggal(tanggal) {
  const hariMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"]
  const d = new Date(tanggal)
  return hariMap[d.getDay()]
}

export default function PeminjamanPage() {
  const [jadwalTerpakai, setJadwalTerpakai] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [resi, setResi] = useState(null)
  const [form, setForm] = useState({
    hari: "senin", jamMulai: "", jamSelesai: "", tanggal: "", tujuan: ""
  })

  // 🔁 Fetch jadwal dari database dan mapping ke jadwalTerpakai
  useEffect(() => {
    fetch('/api/jadwal')
      .then(res => res.json())
      .then(data => {
        const mapping = {}
        for (let item of data) {
          const hari = item.Hari.toLowerCase()
          const jamAwal = formatJam(item.Jam_mulai)
          const jamAkhir = formatJam(item.Jam_ahir)
          const rentang = getRentangJam(jamAwal, jamAkhir, hari)

          if (!mapping[hari]) mapping[hari] = []
          mapping[hari].push(...rentang)
        }

        // Hapus duplikat
        for (let h in mapping) {
          mapping[h] = [...new Set(mapping[h])]
        }

        setJadwalTerpakai(mapping)
      })
  }, [])

  function getJamTersedia(hari) {
    return semuaJam[hari].filter(j => !jadwalTerpakai[hari]?.includes(j))
  }

  function adaBentrok(hari, jamMulai, jamSelesai) {
    const rentang = getRentangJam(jamMulai, jamSelesai, hari)
    return rentang.some(j => jadwalTerpakai[hari]?.includes(j))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const indexMulai = jamToIndex(form.jamMulai)
    const indexSelesai = jamToIndex(form.jamSelesai)

    if (indexMulai === -1 || indexSelesai === -1 || indexMulai >= indexSelesai) {
      alert("Jam tidak valid atau urutannya salah.")
      return
    }

    const hariDariTanggal = namaHariDariTanggal(form.tanggal)
    if (hariDariTanggal !== form.hari) {
      alert(`Tanggal tidak sesuai dengan hari yang dipilih (${form.hari}).`)
      return
    }

    if (adaBentrok(form.hari, form.jamMulai, form.jamSelesai)) {
      alert("Jam yang Anda pilih sudah terpakai.")
      return
    }

    const nomorResi = "RESI-" + Date.now()
    setResi({ ...form, ...akunDummy, nomorResi })
    setShowForm(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
          📅 Pengajuan Peminjaman Laboratorium
        </h1>

        {/* Tabel Jadwal */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <Tabel />
          <div className="mt-4 text-sm text-gray-600 space-x-4">
            <span className="inline-block px-2 py-1 bg-red-400 text-white rounded">Ruangan Dipakai</span>
            <span className="inline-block px-2 py-1 bg-green-200 text-gray-800 rounded">Ruangan Kosong</span>
            <p className="text-gray-600 mb-6">**Peminjaman Lab. dilayani hanya pada jam kantor <strong>08.30 - 16.00</strong></p>
          </div>
        </div>

        {/* Tombol Form */}
        <div className="mb-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✖️ Sembunyikan Form' : '➕ Permohonan Pinjam Ruangan'}
          </button>
        </div>

        {/* Formulir */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow space-y-4 max-w-2xl"
          >
            <div>
              <label className="block font-semibold mb-1">👤 Nama</label>
              <input value={akunDummy.nama} readOnly className="w-full p-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1">🆔 NIM</label>
              <input value={akunDummy.nim} readOnly className="w-full p-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1">🎯 Tujuan Peminjaman</label>
              <textarea
                required
                className="w-full p-2 border rounded"
                onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">📆 Hari</label>
              <select
                className="w-full p-2 border rounded"
                value={form.hari}
                onChange={(e) => {
                  setForm({ ...form, hari: e.target.value, jamMulai: "", jamSelesai: "" })
                }}
              >
                {Object.keys(semuaJam).map((hari) => (
                  <option key={hari} value={hari}>{hari}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-semibold mb-1">⏰ Jam Mulai</label>
                <select
                  required
                  className="w-full p-2 border rounded"
                  value={form.jamMulai}
                  onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                >
                  <option value="">Pilih</option>
                  {getJamTersedia(form.hari).map(jam => (
                    <option key={jam} value={jam}>{jam}</option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label className="block font-semibold mb-1">⏳ Jam Selesai</label>
                <select
                  required
                  className="w-full p-2 border rounded"
                  value={form.jamSelesai}
                  onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
                >
                  <option value="">Pilih</option>
                  {getJamTersedia(form.hari).map(jam => (
                    <option key={jam} value={jam}>{jam}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">📅 Tanggal</label>
              <input
                type="date"
                required
                className="w-full p-2 border rounded"
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
            >
              🚀 Kirim Permohonan
            </button>
          </form>
        )}

        {/* Bukti Resi */}
        {resi && (
          <div className="mt-8 bg-green-50 border border-green-300 p-6 rounded shadow text-green-900">
            <h2 className="font-semibold text-xl mb-2 flex items-center gap-2">✅ Permohonan Berhasil</h2>
            <p><strong>Nama:</strong> {resi.nama}</p>
            <p><strong>NIM:</strong> {resi.nim}</p>
            <p><strong>Hari:</strong> {resi.hari}</p>
            <p><strong>Tanggal:</strong> {resi.tanggal}</p>
            <p><strong>Jam:</strong> {resi.jamMulai} - {resi.jamSelesai}</p>
            <p><strong>Tujuan:</strong> {resi.tujuan}</p>
            <p className="mt-4 font-mono text-sm">Resi: {resi.nomorResi}</p>
          </div>
        )}
      </div>
    </main>
  )

}
