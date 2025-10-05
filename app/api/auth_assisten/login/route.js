import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // 🔹 Cari user asisten berdasarkan username
    const [rows] = await db.query(
      "SELECT * FROM tb_assisten WHERE username = ? AND role = 'assisten'",
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Akun asisten tidak ditemukan atau belum di-approve" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 🔹 Pastikan kolom password ada
    if (!user.password) {
      return NextResponse.json(
        { error: "Data asisten tidak valid (password kosong)" },
        { status: 400 }
      );
    }

    // 🔹 Cek password hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 🔹 Buat token
    const token = await signToken({
      id: user.id, // gunakan id agar seragam dengan API lain
      username: user.username,
      nim: user.nim,
      role: user.role || "assisten",
    });

    const res = NextResponse.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        nim: user.nim,
        role: user.role,
      },
    });

    // 🔹 Simpan token ke cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });

    return res;
  } catch (err) {
    console.error("Login Asisten Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
