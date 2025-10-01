// app/login/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth"; // fungsi verifikasi JWT/token
import LoginForm from "./LoginForm";

export default async function LoginAssistenPage() {
  // 🔹 Ambil cookie token dari request
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;

  // 🔹 Verifikasi token (jika ada)
  const user = token ? await verifyToken(token) : null;

  // 🔹 Kalau sudah login → redirect ke akun assisten
  if (user) {
    redirect("/akun-assisten");
  }

  // 🔹 Kalau belum login → render form login
  return <LoginForm />;
}
