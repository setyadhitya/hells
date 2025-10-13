// app/api/peserta/check/route.js
import mysql from "mysql2/promise";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req) {
  try {
    // Ambil token dari cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, v] = c.split("=");
        return [k, decodeURIComponent(v)];
      })
    );
    const token = cookies.token;
    if (!token) {
      return new Response(JSON.stringify({ error: "Belum login" }), { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "praktikan") {
      return new Response(JSON.stringify({ error: "Akses ditolak" }), { status: 403 });
    }

    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // Cek apakah praktikan terdaftar di tb_peserta
    const [rows] = await conn.execute(
      "SELECT * FROM tb_peserta WHERE praktikan_id = ? LIMIT 1",
      [user.id]
    );

    await conn.end();

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ registered: false, message: "Belum terdaftar di praktikum" }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ registered: true }), { status: 200 });
  } catch (err) {
    console.error("🔥 Error check peserta:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
