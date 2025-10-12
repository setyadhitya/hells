// app/api/praktikan/route.js
import mysql from "mysql2/promise";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";

/**
 * 🔒 API Profil Praktikan
 * - Hanya bisa diakses jika sudah login
 * - Mengambil data berdasarkan username dari token
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || null;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    const [rows] = await connection.execute(
      "SELECT id, username, nama, nim, nomorhp, status FROM tb_praktikan WHERE username = ?",
      [user.username]
    );

    await connection.end();

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Praktikan tidak ditemukan" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (err) {
    console.error("GET /api/praktikan error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
