// app/layout.jsx
import "./globals.css";// app/regler-admin-pengaturan/layout.jsx
import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <>
      {/* Bagian atas yang selalu tampil */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Laboratorium 3 Jaringan Komputer</h1>
        <nav>
          <ul className="flex flex-wrap gap-4">
            <li><Link href="/regler-admin-pengaturan/register" className="underline">Register</Link></li>
            <li><Link href="/regler-admin-pengaturan/dashboard" className="underline">Dashboard</Link></li>
            <li><Link href="/regler-admin-pengaturan/praktikum" className="underline">Praktikum</Link></li>
            <li><Link href="/regler-admin-pengaturan/modul" className="underline">Modul</Link></li>
            <li><Link href="/regler-admin-pengaturan/isimodul" className="underline">Isi Modul</Link></li>
            <li><Link href="/regler-admin-pengaturan/peminjaman" className="underline">Peminjaman</Link></li>
            <li><Link href="/regler-admin-pengaturan/kalender" className="underline">Kalender</Link></li>
            <li><Link href="/regler-admin-pengaturan/akun" className="underline">Akun</Link></li>
            <li><Link href="/regler-admin-pengaturan/rekap" className="underline">Rekap Presensi</Link></li>
          </ul>
        </nav>
      </header>

      {/* Konten halaman */}
      <main className="p-4">{children}</main>
    </>
  );
}
