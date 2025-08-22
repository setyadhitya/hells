import StepItem from './StepItem/page'

export default function ModulContoh() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Modul: Konfigurasi IP</h1>

      <StepItem
        step={1}
        title="Buka Winbox"
        desc="Buka Winbox dan koneksikan ke perangkat Mikrotik menggunakan MAC Address atau IP."
        imageSrc="/images/modul/modul1.jpg"
      />

      <StepItem
        step={2}
        title="Atur IP Address"
        desc="Masuk ke menu IP > Address, lalu tambahkan IP address sesuai skema jaringan."
        imageSrc="/images/modul/modul2.jpg"
      />

      <StepItem
        step={3}
        title="Cek koneksi"
        desc="Gunakan fitur ping di menu Tools > Ping untuk memastikan koneksi ke gateway atau client."
        imageSrc="/images/modul/modul3.jpg"
      />
    </main>
  )
}
