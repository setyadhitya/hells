// app/akun-assisten/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth.js";
import PageClient from "./PageCLient.jsx";

export default async function AkunAssisten() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // 🔹 Kalau belum login → redirect ke login admin
  if (!user) {
    redirect("/login_assisten");
  }

  // 🔹 Kalau role bukan assisten → redirect ke halaman localhost:3000
  if (user.role !== "assisten") {
    redirect("/");
  }

  // ✅ Kalau lolos semua → render client page
  return <PageClient user={user} />;
}
