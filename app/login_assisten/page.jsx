// app/login_assisten/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth"; // fungsi JWT verifier
import LoginForm from "./LoginForm";

export default async function LoginAssistenPage() {
  // 🔹 Ambil cookie token dari browser
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;

  // 🔹 Verifikasi token (jika ada)
  const user = token ? await verifyToken(token) : null;

  // 🔹 Jika user sudah login → redirect ke halaman akun
  if (user && user.role === "assisten") {
    redirect("/akun_assisten");
  }

  // 🔹 Jika belum login → tampilkan form login
  return <LoginForm />;
}
