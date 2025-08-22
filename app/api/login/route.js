import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

export async function POST(req) {
  const { username, password } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "";

  try {
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_users WHERE username = ?", [username]);
    const user = rows[0];
    const attempt_time = new Date();

    if (!user) {
      await conn.execute(
        "INSERT INTO tb_log (username_attempt, attempt_time, success, message, ip) VALUES (?,?,?,?,?)",
        [username, attempt_time, false, "user not found", ip]
      );
      await conn.end();
      return new Response(JSON.stringify({ message: "User not found" }), { status: 401 });
    }

    if (user.role === "praktikan") {
      await conn.execute(
        "INSERT INTO tb_log (username_attempt, attempt_time, success, message, ip) VALUES (?,?,?,?,?)",
        [username, attempt_time, false, "praktikan login disallowed", ip]
      );
      await conn.end();
      return new Response(JSON.stringify({ message: "Praktikan tidak diizinkan login" }), { status: 403 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      await conn.execute(
        "INSERT INTO tb_log (username_attempt, attempt_time, success, message, ip) VALUES (?,?,?,?,?)",
        [username, attempt_time, false, "wrong password", ip]
      );
      await conn.end();
      return new Response(JSON.stringify({ message: "Password salah" }), { status: 401 });
    }

    // ✅ Buat JWT dan simpan di cookie
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "8h" }
    );

    cookies().set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 8 * 3600,
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
