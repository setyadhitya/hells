'use client'
import { useState, useEffect } from 'react'

export default function FormPendaftaran() {
  const [mataKuliahList, setMataKuliahList] = useState([])
  const [selectedMatkul, setSelectedMatkul] = useState([''])
  const [ktmFile, setKtmFile] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [krsFile, setKrsFile] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [userId, setUserId] = useState(null)
  const [mounted, setMounted] = useState(false)

  // tanda bahwa komponen sudah mount di client
  useEffect(() => setMounted(true), [])

  // ambil token dan decode userId dengan dynamic import
  useEffect(() => {
    if (!mounted) return

    import('jwt-decode').then(jwt_decode => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const decoded = jwt_decode.default(token) // gunakan .default
          setUserId(decoded.id)
        } catch (err) {
          console.error('Token invalid', err)
        }
      }
    })
  }, [mounted])

  // ambil daftar mata kuliah
  useEffect(() => {
    fetch('/api/praktikum')
      .then(res => res.json())
      .then(data => setMataKuliahList(data))
      .catch(err => console.error(err))
  }, [])

  const handleMatkulChange = (index, value) => {
    const newSelected = [...selectedMatkul]
    newSelected[index] = value
    setSelectedMatkul(newSelected)
  }

  const addMatkul = () => setSelectedMatkul([...selectedMatkul, ''])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ktmFile || !fotoFile || !krsFile) {
      setToast({ show: true, message: 'Semua file wajib diupload', type: 'error' })
      return
    }

    if (!userId) {
      setToast({ show: true, message: 'User belum login', type: 'error' })
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
    formData.append('user_id', userId)

    try {
      const res = await fetch('/api/pendaftaran', {
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
                {mataKuliahList.map(matkul => (
                  <option key={matkul.ID} value={matkul.ID}>{matkul.Mata_Kuliah}</option>
                ))}
              </select>
              {i === selectedMatkul.length -1 && (
                <button type="button" onClick={addMatkul} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">+</button>
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

          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Daftar</button>
        </form>
      </div>
    </main>
  )
}
