// app/api/auth_assisten/login/route.js
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // 🔍 Cari user asisten
    const [rows] = await db.query(
      "SELECT * FROM tb_assisten WHERE username=? AND role='assisten'",
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Akun asisten tidak ditemukan atau belum diaktifkan" },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (!user.password) {
      return NextResponse.json(
        { error: "Data asisten tidak valid (password kosong)" },
        { status: 400 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 🔹 Buat token JWT (huruf kecil agar konsisten)
    const token = await signToken({
      id: user.id,
      username: user.username,
      role: (user.role || "assisten").toLowerCase(),
    });

    const res = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        role: (user.role || "assisten").toLowerCase(),
      },
    });

    // 🔹 Auto-detect environment
    const isProd = process.env.NODE_ENV === "production";

    // 🔹 Simpan cookie dengan pengaturan dinamis
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd, // ✅ true di server HTTPS, false di localhost
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
