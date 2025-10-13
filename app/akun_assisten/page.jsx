// app/akun_assisten/page.jsx
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth.js";
import PageClient from "./PageClient.jsx";

export default async function AkunAssisten() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  // 🔹 Tidak perlu redirect di sini karena middleware sudah tangani
  return <PageClient user={user} />;
}
