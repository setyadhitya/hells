"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AirVent,
  BookOpen,
  LayoutDashboard,
  FileText,
} from "lucide-react";

export default function Home() {
  const navItems = [
    { name: "Jadwal Praktikum", href: "/jadwal", icon: LayoutDashboard },
    { name: "Modul Praktikum", href: "/modul", icon: BookOpen },
    { name: "Akun Asisten", href: "/akun_assisten", icon: AirVent },
    { name: "Akun Mahasiswa", href: "/login", icon: FileText },
  ];

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-gray-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="py-12 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-extrabold text-gray-800 mb-6 drop-shadow-sm">
            Selamat Datang di{" "}
            <span className="text-blue-700 bg-blue-100 px-2 rounded-lg shadow-sm">
              Sys-ASLPDC-T2B2
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Sistem Akses Seluruh Layanan Praktikum Dengan Cepat, Terintegrasi, Dan Tanpa Basa-Basi.
          </p>
        </motion.div>

        {/* Background Decorative Elements */}
        <div className="absolute -top-20 -right-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </section>

      {/* Menu Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 pb-24">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={item.href}
                className="group block bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl 
                shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all p-8 
                hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 
                  mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner"
                >
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Akses informasi dan layanan terkait {item.name.toLowerCase()} di sini.
                </p>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-600 py-6 border-t bg-white/60 backdrop-blur-md">
        <strong>© 2025 LabKom 3 Jaringan</strong> • Dibuat setengah semangat oleh{" "}
        <span className="text-blue-700 font-medium">PLP</span>{" "}• Lab 3 Jaringan Komputer
      </footer>
    </main>
  );
}
