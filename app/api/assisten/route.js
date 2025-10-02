// app/api/assisten/route.js
import mysql from "mysql2/promise";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";

export async function GET() {
  try {
    // Ambil token dari cookies
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

    // Ambil data dari tb_assisten berdasarkan username dari token
    const [rows] = await connection.execute(
      "SELECT id, username, nama, nim, nomorhp, status FROM tb_assisten WHERE username = ?",
      [user.username]
    );

    await connection.end();

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Assisten tidak ditemukan" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
