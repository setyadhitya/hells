import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";
import { use } from "react";

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        // Cari user assiten berdasarkan username
        const [rows] = await db.query(
            "SELECT * FROM tb_assisten WHERE username = ? AND role = 'assisten'",
            [username] // ⚠️ username sebenarnya disimpan di kolom username
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Akun assiten tidak ditemukan atau belum di approve" }, { status: 401 });
        }

        const user = rows[0];

        // Cek password hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return NextResponse.json({ error: "Password salah" }, { status: 401 });
        }

        // Buat token
        const token = await signToken({
    assisten_id: user.assisten_id,
    username: user.username,
    nim: user.nim,
    role: user.role || "assisten",
});

const res = NextResponse.json({
    message: "Login berhasil",
    token,
    user: {
        assisten_id: user.assisten_id,
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


        // Untuk assiten: token boleh dikembalikan via body
        // (admin pakai cookie, assiten pakai localStorage)
        return res;
    } catch (err) {
        console.error("Login Assiten Error:", err.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
