import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";
import { use } from "react";

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        // Cari user praktikan berdasarkan username
        const [rows] = await db.query(
            "SELECT * FROM tb_praktikan WHERE username = ? AND role = 'praktikan'",
            [username] // ⚠️ username sebenarnya disimpan di kolom username
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Akun praktikan tidak ditemukan atau belum di approve" }, { status: 401 });
        }

        const user = rows[0];

        // Cek password hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return NextResponse.json({ error: "Password salah" }, { status: 401 });
        }

        // Buat token
        const token = await signToken({
    praktikan_id: user.praktikan_id,
    username: user.username,
    nim: user.nim,
    role: user.role || "praktikan",
});

const res = NextResponse.json({
    message: "Login berhasil",
    token,
    user: {
        praktikan_id: user.praktikan_id,
        username: user.username,
        nim: user.nim,
        role: user.role,
    },
});


        // simpan juga ke cookie
        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1 jam
        });


        // Untuk praktikan: token boleh dikembalikan via body
        // (admin pakai cookie, praktikan pakai localStorage)
        return res;
    } catch (err) {
        console.error("Login Praktikan Error:", err.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
