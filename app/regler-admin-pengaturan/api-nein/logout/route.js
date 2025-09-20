import { cookies } from "next/headers";

export async function POST() {
  // ✅ Hapus cookie dengan path "/" (harus sama persis dengan login)
  cookies().set("token", "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",     // 🔑 disamakan, biar cookie benar-benar hilang
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
