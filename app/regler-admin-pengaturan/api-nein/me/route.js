import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// fungsi koneksi database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

export async function GET() {
  // ambil token dari cookies
      const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
  if (!token) {
    return Response.json({ ok: false, message: "Token tidak ada" }, { status: 401 });
  }

  try {
    // verifikasi token
    const data = jwt.verify(token, process.env.JWT_SECRET || "devsecret");

    // koneksi ke database
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT id, username, role FROM tb_users WHERE id = ? LIMIT 1",
      [data.id]
    );
    await conn.end();

    const user = rows[0];
    if (!user) {
      return Response.json({ ok: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    // sukses
    return Response.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error("JWT Error:", err.message);
    return Response.json({ ok: false, message: "Token tidak valid" }, { status: 403 });
  }
}
