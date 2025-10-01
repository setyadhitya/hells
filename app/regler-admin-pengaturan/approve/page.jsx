import ApproveClient from "./ApproveClient";
import { requireRole } from "../../../lib/requireRole";
import Link from "next/link";

export default async function ApprovePage() {
  const user = await requireRole(["admin"]);
  if (!user) {
    return (
      <main className="max-w-xl mx-auto py-10">
        <h2 className="text-xl font-bold">Not authenticated</h2>
        <p className="mt-2 text-gray-600">Silakan login kembali.</p>
        <div className="mt-4 space-x-4">
          <Link href="/regler-admin-pengaturan/login" className="underline">Login</Link>
        </div>
      </main>
    );
  }

  return <ApproveClient user={user} />;
}
