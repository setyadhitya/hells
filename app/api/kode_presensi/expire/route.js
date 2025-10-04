import mysql from "mysql2/promise";
import { verifyToken } from "../../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

export async function POST(req) {
  const conn = await getConnection();
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("Unauthorized");
    const user = await verifyToken(token);

    // Update status presensi aktif milik user ini jadi expired
    await conn.execute(
      `UPDATE tb_kode_presensi 
       SET status='expired' 
       WHERE generated_by_assisten_id=? AND status='aktif'`,
      [user.id]
    );

    return new Response(JSON.stringify({ message: "Presensi expired" }), { status: 200 });
  } catch (err) {
    console.error("POST /expire error:", err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  } finally {
    await conn.end();
  }
}
