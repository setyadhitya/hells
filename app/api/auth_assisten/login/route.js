import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const [rows] = await db.query(
      "SELECT * FROM tb_assisten WHERE username=? AND role='assisten'",
      [username]
    );

    if (rows.length === 0)
      return NextResponse.json(
        { error: "Akun asisten tidak ditemukan atau belum diaktifkan" },
        { status: 401 }
      );

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password || "");
    if (!match)
      return NextResponse.json({ error: "Password salah" }, { status: 401 });

    const token = await signToken({
      id: user.id,
      username: user.username,
      role: (user.role || "assisten").toLowerCase(),
    });

    const res = NextResponse.json({
      message: "Login berhasil",
      user: { id: user.id, username: user.username, role: user.role },
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd, // ✅ hanya true di production
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });

    return res;
  } catch (err) {
    console.error("Login Asisten Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
