// app/profil/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth";
import PageClient from "./PageClient";

export default async function Profil() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // 🔹 Kalau belum login → redirect ke login admin
  if (!user) {
    redirect("/regler-admin-pengaturan/login");
  }

  // 🔹 Kalau role bukan praktikan → redirect ke dashboard
  if (user.role !== "praktikan") {
    redirect("/regler-admin-pengaturan/dashboard");
  }

  // ✅ Kalau lolos semua → render client page
  return <PageClient user={user} />;
}
