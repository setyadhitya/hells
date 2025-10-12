// app/presensi/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth";
import PageClient from "./PageClient";

/**
 * 🌐 Halaman Presensi
 * - Hanya bisa diakses oleh praktikan yang sudah login
 */
export default async function PresensiPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login"); // jika belum login
  }

  if (user.role !== "praktikan") {
    redirect("/"); // jika bukan praktikan
  }

  return <PageClient user={user} />;
}
