import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth";
import PageClient from "./PageClient";

export default async function PresensiPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // 🔹 Kalau belum login → redirect ke login admin
  if (!user) {
    redirect("/login"); // cukup redirect dari next/navigation
  }

  // 🔹 Kalau role bukan praktikan → redirect ke dashboard admin
  if (user.role !== "praktikan") {
    redirect("/regler-admin-pengaturan/dashboard");
  }

  // ✅ Render client page
  return <PageClient user={user} />;
}
