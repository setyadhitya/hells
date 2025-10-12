import PageClient from "./PageClient";
import Link from "next/link";
import { requireRole } from "../../../lib/requireRole";

export default async function AssistenPraktikumPage() {
  const user = await requireRole(["admin", "laboran"]);

  if (!user) {
    return (
      <main className="max-w-xl mx-auto py-10 text-center">
        <h2 className="text-xl font-bold">Not authenticated</h2>
        <p className="mt-2 text-gray-600">Silakan login.</p>
        <div className="mt-4">
          <Link href="/regler-admin-pengaturan/login" className="underline">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return <PageClient user={user} />;
}
