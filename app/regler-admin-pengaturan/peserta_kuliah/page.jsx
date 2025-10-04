import Link from "next/link"
import { requireRole } from "../../../lib/requireRole"
import PesertaClient from "./PesertaCLient"


export default async function Peserta() {
  const user = await requireRole(["admin"]) // hanya admin yang boleh masuk berasal dari lib/requireRole


  if (!user) {
    return (
      <main className="max-w-xl mx-auto py-10">
        <h2 className="text-xl font-bold">Not authenticated</h2>
        <p className="mt-2 text-gray-600">Silakan login.</p>
        <div className="mt-4 space-x-4">
          <Link href="/regler-admin-pengaturan/login" className="underline">Login</Link>
        </div>
      </main>
    )
  }

  
  return <PesertaClient user={user} />
}
