// app/akun_assisten/kode_presensi/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// ⚠️ dari file ini (app/akun_assisten/kode_presensi) ke /lib/auth
// harus naik tiga tingkat: ../../../lib/auth
import { verifyToken } from "../../../lib/auth";
import PageClient from "./PageClient";

/**
 * Halaman server-side wrapper untuk Kode Presensi.
 * - Memeriksa cookie token dan memverifikasi JWT.
 * - Redirect ke login jika tidak autentik.
 * - Redirect ke homepage jika role bukan 'assisten'.
 * - Jika valid, render komponen client-side dengan prop user.
 */
export default async function KodePresensiPage() {
  // Ambil cookie dari request (server-side)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;

  // Verifikasi token jika ada
  const user = token ? await verifyToken(token) : null;

  // Jika belum login → arahkan ke halaman login asisten
  if (!user) {
    redirect("/login_assisten");
  }

  // Jika bukan role 'assisten' → tolak akses dengan redirect ke root
  if (user.role !== "assisten") {
    redirect("/");
  }

  // Jika lolos semua pengecekan → render client component dan kirim data user
  return <PageClient user={user} />;
}
