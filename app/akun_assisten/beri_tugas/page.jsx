import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../../lib/auth.js";
import PageClient from "./PageClient.jsx";

export default async function BeriTugasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect("/login_assisten");
  if (user.role !== "assisten") redirect("/");

  return <PageClient user={user} />;
}
