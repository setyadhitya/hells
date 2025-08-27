import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // hapus token dengan overwrite
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // langsung expired
  });

  return Response.json({ ok: true, message: "Logout berhasil" });
}
