// app/modul/[slug]/page.js
import React from "react";

export default function ModulPage({ params }) {
  // ✅ di Next.js 15, params adalah Promise, jadi perlu React.use()
  const { slug } = React.use(params);

  // Contoh data modul (nanti bisa ganti pakai database)
  const modulList = {
    jaringan: {
      title: "Modul Jaringan",
      content: "Materi dasar tentang jaringan komputer, IP Address, Subnetting, dan Routing.",
    },
    web: {
      title: "Modul Web Programming",
      content: "Materi pembuatan website dengan HTML, CSS, JavaScript, dan PHP/MySQL.",
    },
    keamanan: {
      title: "Modul Keamanan",
      content: "Dasar keamanan sistem informasi, enkripsi, dan autentikasi.",
    },
  };

  const modul = modulList[slug];

  if (!modul) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600">Modul yang Anda cari tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{modul.title}</h1>
      <p className="text-gray-700">{modul.content}</p>
    </div>
  );
}
