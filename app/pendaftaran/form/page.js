'use client'
import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode"

export default function FormPendaftaran() {
  const [mataKuliahList, setMataKuliahList] = useState([])
  const [selectedMatkul, setSelectedMatkul] = useState([''])
  const [ktmFile, setKtmFile] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [krsFile, setKrsFile] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [userInfo, setUserInfo] = useState({ id_nim: null, nim: '', nama: '' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

// ambil token & data user
useEffect(() => {
  const fetchPraktikan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);

      const res = await fetch(`/api/praktikan/${decoded.id_nim}`);
      if (!res.ok) throw new Error("Gagal ambil data praktikan");

      const data = await res.json();

      // perbaikan di sini
      setUserInfo({
        id_nim: data.id,     // sesuaikan dengan kolom di tb_nim
        nim: data.nim,
        nama: data.nama,
      });

      // kalau mau sekaligus isi mata kuliah
      if (data.mata_kuliah) {
        setMataKuliahList(data.mata_kuliah.split(","));
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchPraktikan();
}, []);



  const handleMatkulChange = (index, value) => {
    const newSelected = [...selectedMatkul]
    newSelected[index] = value
    setSelectedMatkul(newSelected)
  }

  const addMatkul = () => setSelectedMatkul([...selectedMatkul, ''])
  const removeMatkul = (index) => {
    const newSelected = [...selectedMatkul]
    newSelected.splice(index, 1)
    setSelectedMatkul(newSelected)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ktmFile || !fotoFile || !krsFile) {
      setToast({ show: true, message: 'Semua file wajib diupload', type: 'error' })
      return
    }

    // validasi mata kuliah unik
    const uniqueMatkul = new Set(selectedMatkul)
    if (uniqueMatkul.size !== selectedMatkul.length) {
      setToast({ show: true, message: 'Mata kuliah tidak boleh sama', type: 'error' })
      return
    }

    const formData = new FormData()
    selectedMatkul.forEach((m) => formData.append('Mata_Kuliah[]', m))
    formData.append('ktm', ktmFile)
    formData.append('foto', fotoFile)
    formData.append('krs', krsFile)
    formData.append('id_nim', userInfo.id_nim)

    try {
      const res = await fetch('/api/pendaftaran/form', {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      if (result.message) setToast({ show: true, message: result.message, type: 'success' })
      else setToast({ show: true, message: result.error, type: 'error' })
    } catch (err) {
      setToast({ show: true, message: 'Gagal mendaftar', type: 'error' })
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50 flex justify-center">
      <div className="w-full max-w-lg">
        {toast.show && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white transition-opacity ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
            onAnimationEnd={() => setToast({ ...toast, show: false })}
          >
            {toast.message}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4 text-gray-800">Form Pendaftaran Praktikum</h1>

        <div className="mb-4 p-3 border rounded bg-gray-100">
          <p><strong>NIM:</strong> {userInfo.nim}</p>
          <p><strong>Nama:</strong> {userInfo.nama}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
          {selectedMatkul.map((val, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={val}
                onChange={(e) => handleMatkulChange(i, e.target.value)}
                className="border p-2 rounded flex-1"
                required
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {mataKuliahList.map((matkul, idx) => (
                  <option key={idx} value={matkul}>{matkul}</option>
                ))}
              </select>
              {i === selectedMatkul.length -1 && (
                <button
                  type="button"
                  onClick={addMatkul}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  +
                </button>
              )}
              {selectedMatkul.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMatkul(i)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  -
                </button>
              )}
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">Upload KTM</label>
            <input type="file" accept="image/*" onChange={e => setKtmFile(e.target.files[0])} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Upload Foto</label>
            <input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files[0])} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Upload KRS</label>
            <input type="file" accept="image/*,application/pdf" onChange={e => setKrsFile(e.target.files[0])} required />
          </div>

          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Daftar
          </button>
        </form>
      </div>
    </main>
  )
}
