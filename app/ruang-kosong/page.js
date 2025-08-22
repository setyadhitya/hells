'use client'

import React from 'react'
import Tabel from '../tabel/page'

export default function Ruangan() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-blue-800 text-center">
          📋 Jadwal Ketersediaan Ruangan
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Lihat ruangan kosong dan terpakai berdasarkan jadwal praktikum
        </p>

        <div className="shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <Tabel />
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded-sm border border-gray-300"></div>
            <span className="text-gray-700 font-medium">Ruangan Dipakai</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-300 rounded-sm border border-gray-300"></div>
            <span className="text-gray-700 font-medium">Ruangan Kosong</span>
          </div>
        </div>
      </div>
    </main>
  )
}
