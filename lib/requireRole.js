// Import modul bawaan Next.js untuk membaca cookie dan header request
import { cookies, headers } from "next/headers";
// Import fungsi verifikasi token JWT (mengecek apakah user sudah login dan valid)
import { verifyToken } from "./auth";
// Import fungsi redirect bawaan Next.js untuk mengarahkan user ke halaman lain
import { redirect } from "next/navigation";

/**
 * requireRole()
 * ---------------------
 * Fungsi ini digunakan untuk membatasi akses ke halaman atau server component
 * berdasarkan peran (role) pengguna.
 *
 * Jika user belum login → diarahkan ke halaman login.
 * Jika user sudah login tapi tidak punya role yang sesuai → diarahkan ke halaman lain.
 *
 * @param {Array} allowedRoles - Daftar role yang diizinkan mengakses halaman
 * @returns {Object} user - Data user hasil verifikasi token
 */
export async function requireRole(allowedRoles = []) {
  // 🔐 Ambil cookie dari request saat ini
  const cookieStore = await cookies();

  // Ambil token login dari cookie
  const token = cookieStore.get("token")?.value || null;

  // Verifikasi token untuk mendapatkan data user (id, username, role, dsb)
  const user = token ? await verifyToken(token) : null;

  // 🚫 Jika user belum login (token tidak ada atau tidak valid)
  if (!user) {
    // Ambil header request saat ini (berisi info path, user-agent, dsb)
    const headersList = await headers();

    // Ambil path halaman yang sedang diakses (misal: "/regler-admin-pengaturan/rekap")
    const currentPath = headersList.get("x-invoke-path") || "";

    // Redirect ke halaman login admin, sambil menyimpan path yang sedang diakses
    // agar setelah login bisa diarahkan kembali ke halaman asal
    redirect(
      `/regler-admin-pengaturan/login?redirect=${encodeURIComponent(currentPath)}`
    );
  }

  // 🧱 Jika user sudah login, tapi role-nya tidak termasuk dalam allowedRoles
  if (!allowedRoles.includes(user.role)) {
    // Role praktikan diarahkan ke halaman akun praktikan
    if (user.role === "praktikan") {
      redirect("/akun_praktikan");
    }
    // Role admin diarahkan ke dashboard admin
    else if (user.role === "admin") {
      redirect("/regler-admin-pengaturan/dashboard");
    }
    // Role assisten diarahkan ke halaman akun assiten
    else if (user.role === "assisten") {
      redirect("/akun_assisten");
    }
    // diarahkan ke beranda
    else {
      redirect("/"); // fallback
    }
  }

  // ✅ Jika user lolos verifikasi dan role cocok → kembalikan data user
  return user;
}
