/* app/page.tsx (Next.js 15 App Router) */
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, Users, ClipboardList, LayoutDashboard, FileText } from "lucide-react"

export default function Home() {
  const navItems = [
    { name: 'Jadwal Praktikum', href: '/jadwal', icon: LayoutDashboard },
    { name: 'Presensi Praktikum', href: '/presensi', icon: ClipboardList },
    { name: 'Modul Praktikum', href: '/modul', icon: BookOpen },
    { name: 'Peminjaman Lab', href: '/peminjaman', icon: Users },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Akun Mahasiswa', href: '/login', icon: FileText },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

      {/* Hero Section */}
      <section className="py-24 text-center">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6">
          Selamat Datang di <span className="text-blue-600">LabKom 3</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Situs ini menyediakan layanan penting untuk mendukung kegiatan praktikum Anda dengan cepat, mudah, dan tanpa basa-basi.
        </p>
      </section>

      {/* Menu Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-24">
        {navItems.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={item.href}
                className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 group hover:bg-blue-50"
              >
                {/* Icon Circle */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">{item.name}</h3>
                <p className="text-gray-600 text-sm">
                  Akses informasi dan layanan terkait {item.name.toLowerCase()} di sini.
                </p>
              </Link>
            </motion.div>
          )
        })}
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t bg-white/70 backdrop-blur">
        <strong>© 2025 LabKom 3 Jaringan</strong> • Dibuat tanpa basa-basi oleh <span className="text-blue-600">PLP</span>
      </footer>
    </main>
  )
}
