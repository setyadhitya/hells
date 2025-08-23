import Link from 'next/link'

export default function ModulMenu() {
  const modulList = [
    { name: 'Konfigurasi IP', slug: 'jaringan', desc: 'Belajar mengatur IP Address di Mikrotik.' },
    { name: 'Routing Dasar', slug: 'web', desc: 'Praktikum routing sederhana antar jaringan.' },
    { name: 'Firewall Dasar', slug: 'keamanan', desc: 'Membuat aturan firewall dasar di Mikrotik.' },
    { name: 'DHCP Server', slug: 'dhcp', desc: 'Mengkonfigurasi DHCP server untuk client.' },
  ]

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">📚 Daftar Modul Praktikum</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulList.map((modul) => (
          <Link
            key={modul.slug}
            href={`/modul/${modul.slug}`}
            className="block bg-white rounded-xl shadow hover:shadow-lg hover:bg-blue-50 transition p-6"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">{modul.name}</h2>
            <p className="text-gray-600 text-sm">{modul.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
