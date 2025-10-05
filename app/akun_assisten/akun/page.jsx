// app/profil/akun/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../../lib/auth"; // ← perhatikan path
import PageClient from "./PageClient";

export default async function AkunPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "assisten") {
    redirect("/regler-admin-pengaturan/dashboard");
  }

  return <PageClient user={user} />;
}
