// app/api/auth_assisten/login/route.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/auth";
import { secureHandler } from "../../../../lib/secureApi"; // middleware keamanan global

// 🔹 Fungsi koneksi database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 POST — Login untuk Asisten ====================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: false, // login tidak butuh token
    rateLimit: true,    // batasi percobaan login
    handler: async ({ req, ip, logAudit }) => {
      const { username, password } = await req.json();

      // Validasi input awal
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: "Username dan password wajib diisi" }),
          { status: 400 }
        );
      }

      const db = await getConnection();
      const [rows] = await db.execute(
        "SELECT * FROM tb_assisten WHERE username=? AND role='assisten' LIMIT 1",
        [username]
      );
      await db.end();

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Akun asisten tidak ditemukan atau belum aktif" }),
          { status: 401 }
        );
      }

      const user = rows[0];

      // 🔐 Pastikan password valid
      if (!user.password) {
        return new Response(
          JSON.stringify({ error: "Password kosong di database" }),
          { status: 400 }
        );
      }

      // 🔐 Cocokkan password hash
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // Catat percobaan login gagal
        await logAudit({
          userId: user.id,
          username: user.username,
          action: "login_failed_assisten",
          ip,
        });
        return new Response(JSON.stringify({ error: "Password salah" }), { status: 401 });
      }

      // 🪪 Buat token JWT
      const token = await signToken({
        id: user.id,
        username: user.username,
        nim: user.nim,
        role: user.role || "assisten",
      });

      // 🔹 Simpan token ke cookie (httpOnly agar tidak bisa diakses JS)
      const res = NextResponse.json({
        message: "Login berhasil",
        user: {
          id: user.id,
          username: user.username,
          nim: user.nim,
          role: user.role,
        },
      });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60, // 1 jam
      });

      // Catat login sukses di audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "login_success_assisten",
        ip,
      });

      return res;
    },
  });
}
