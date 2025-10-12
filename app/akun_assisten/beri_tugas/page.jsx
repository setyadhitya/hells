// app/akun_assisten/beri_tugas/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../../lib/auth.js";
import PageClient from "./PageClient.jsx";

export default async function BeriTugasPage() {
  // 🔒 Ambil token login dari cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // 🚫 Redirect jika belum login
  if (!user) redirect("/login_assisten");

  // 🚫 Redirect jika bukan asisten
  if (user.role !== "assisten") redirect("/");

  // ✅ Render halaman jika lolos semua validasi
  return <PageClient user={user} />;
}
