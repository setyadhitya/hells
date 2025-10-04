import mysql from "mysql2/promise";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req) {
  try {
    // 🔒 Autentikasi
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const user = await verifyToken(token);
    if (!user || user.role !== "assisten") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // 🔹 Koneksi DB
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 🔹 Ambil id + Mata Kuliah
    const [rows] = await conn.execute(
      "SELECT id, mata_kuliah FROM tb_praktikum ORDER BY mata_kuliah ASC"
    );

    await conn.end();

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("GET dropdown praktikum error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
