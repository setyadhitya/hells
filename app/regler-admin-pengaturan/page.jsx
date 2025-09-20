import Link from 'next/link'

export default function Home() {
  return (
    <main className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Next.js App Router - JWT Auth (Demo)</h1>
            <h1 className="text-2xl font-bold mb-4">Mohon jangan di hack kak - Kami buat tidak ada anggaran dari instansi</h1>
      <div className="space-x-2">
        <Link href="/regler-admin-pengaturan/login" className="underline">Login</Link>
      </div>
    </main>
  )
}
