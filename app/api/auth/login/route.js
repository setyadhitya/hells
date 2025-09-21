import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Cari user
    const [rows] = await db.query("SELECT * FROM tb_users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
    }

    const user = rows[0];

    // Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    console.log("DEBUG user.role:", user.role);

    // Buat token
    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role || "user",
    });

    // Set cookie
    const res = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
