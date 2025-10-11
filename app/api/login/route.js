import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { RateLimiterMemory } from "rate-limiter-flexible";

// 💡 Rate limiter di memori (bisa diganti Redis kalau nanti deploy)
const rateLimiter = new RateLimiterMemory({
  points: 5, // maksimal 5 percobaan
  duration: 60, // per 60 detik
});

// 🔒 Utility: Koneksi database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔐 Handler utama
export async function POST(req) {
  const ip =
    headers().get("x-forwarded-for") ||
    headers().get("cf-connecting-ip") ||
    "unknown";
  const attempt_time = new Date();

  try {
    // 🧠 Rate limit per IP
    try {
      await rateLimiter.consume(ip);
    } catch {
      return new Response(JSON.stringify({ message: "Terlalu banyak percobaan login. Coba lagi nanti." }), {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }

    // 🧩 Validasi input sederhana
    const { username, password } = await req.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ message: "Username dan password wajib diisi" }), {
        status: 400,
      });
    }

    // 🛡️ Anti-CSRF sederhana (optional tapi direkomendasikan)
    const referer = headers().get("referer");
    const origin = headers().get("origin");
    if (origin && !origin.startsWith("https://localhost")) {
      return new Response(JSON.stringify({ message: "Akses tidak diizinkan" }), { status: 403 });
    }

    const conn = await getConnection();

    // 🔍 Cek user
    const [rows] = await conn.execute(
      "SELECT * FROM tb_users_praktikan WHERE username = ?",
      [username]
    );
    const user = rows[0];

    if (!user) {
      await conn.execute(
        "INSERT INTO tb_log (username_attempt, attempt_time, success, message, ip) VALUES (?,?,?,?,?)",
        [username, attempt_time, false, "user not found", ip]
      );
      await conn.end();
      return new Response(JSON.stringify({ message: "User tidak ditemukan" }), { status: 401 });
    }

    // ✅ Bandingkan password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      await conn.execute(
        "INSERT INTO tb_log (username_attempt, attempt_time, success, message, ip) VALUES (?,?,?,?,?)",
        [username, attempt_time, false, "wrong password", ip]
      );
      await conn.end();
      return new Response(JSON.stringify({ message: "Password salah" }), { status: 401 });
    }

    // 🔑 Buat JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "8h" }
    );

    // 🍪 Simpan di cookie aman
    cookies().set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 8 * 3600, // 8 jam
    });

    await conn.execute(
      "INSERT INTO tb_log (username_attempt, attempt_time, success, message, ip) VALUES (?,?,?,?,?)",
      [username, attempt_time, true, "login success", ip]
    );
    await conn.end();

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
