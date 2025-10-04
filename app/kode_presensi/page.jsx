// app/kode_presensi/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth";
import PageClient from "./PageClient";

export default async function KodePresensiPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // 🔹 kalau belum login → redirect
  if (!user) {
    redirect("/login_assisten");
  }

  // 🔹 hanya role assisten yang boleh
  if (user.role !== "assisten") {
    redirect("/");
  }

  return <PageClient user={user} />;
}
