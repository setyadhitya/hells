// app/api/auth_praktikan/login/route.js
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";

/**
 * 🔐 Login Praktikan
 * - Verifikasi username & password
 * - Cek status akun sudah di-approve
 * - Simpan token JWT di cookie httpOnly
 */
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // 🔹 Cari user praktikan berdasarkan username
    const [rows] = await db.query(
      "SELECT * FROM tb_praktikan WHERE username = ? AND role = 'praktikan'",
      [username]
    );

    // Jika akun tidak ditemukan
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Akun praktikan tidak ditemukan atau belum di-approve" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 🔹 Validasi password hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 🔹 Buat token JWT
    const token = await signToken({
      id: user.id || user.praktikan_id, // jaga-jaga kolom id
      username: user.username,
      nim: user.nim,
      role: user.role || "praktikan",
    });

    // 🔹 Buat response JSON
    const res = NextResponse.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id || user.praktikan_id,
        username: user.username,
        nim: user.nim,
        role: user.role,
      },
    });

    // 🔹 Simpan token ke cookie (1 jam)
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("Login Praktikan Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
