// app/login/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth";
import LoginForm from "./LoginForm";

/**
 * 🔐 Halaman Login Praktikan
 * - Jika sudah login → redirect ke /profil
 * - Jika belum → tampilkan form login
 */
export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;

  const user = token ? await verifyToken(token) : null;

  if (user) redirect("/profil");

  return <LoginForm />;
}
