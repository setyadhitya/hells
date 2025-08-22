/* app/page.tsx or app/page.jsx (Next.js 15 App Router) */

'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const navItems = [
    { name: 'Jadwal Praktikum', href: '/jadwal' },
    { name: 'Presensi Praktikum', href: '/presensi' },
    { name: 'Modul Praktikum', href: '/modul' },
    { name: 'Peminjaman Lab', href: '/peminjaman' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Pendaftaran', href: '/pendaftaran' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">

      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Selamat Datang di Situs LabKom 3</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Situs ini menyediakan layanan penting untuk kegiatan praktikum tanpa basa-basi.
        </p>
      </section>

      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-20">
        {navItems.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-4">
              Akses informasi dan layanan terkait {item.name.toLowerCase()} di sini.
            </p>
            <Link
              href={item.href}
              className="text-blue-600 font-medium hover:underline"
            >
              Lihat Detail
            </Link>
          </div>
        ))}
      </section>

      <footer className="text-center text-sm text-gray-400 py-1 border-t">
        <strong>© 2025 LabKom 3 Jaringan. Dibuat tanpa basa-basi oleh PLP.</strong>
      </footer>
    </main>
  );
}
