import "./globals.css";
import DarkModeToggle from "./DarkModeToggle";
import CsrfProvider from "./components/CsrfProvider"; // ✅ tambahkan ini

export const metadata = {
  title: "Lab. 3 Jaringan Komputer",
  description: "Aplikasi layanan praktikum terintegrasi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 transition-colors duration-500 dark:bg-gray-900 dark:text-gray-100">
        {/* 🔒 Komponen ini memastikan token CSRF aktif di seluruh halaman */}
        <CsrfProvider />

        {/* 🌗 Tombol dark mode tetap berjalan seperti biasa */}
        <DarkModeToggle />

        {/* 🧱 Konten halaman */}
        {children}
      </body>
    </html>
  );
}
