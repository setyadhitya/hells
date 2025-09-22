import mysql from "mysql2/promise";
import { verifyToken } from "../../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern", // sesuaikan
  });
}

async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// 🔹 GET semua mata kuliah dari tb_praktikum
export async function GET(req) {
  try {
    await auth(req);
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT DISTINCT Mata_Kuliah FROM tb_praktikum ORDER BY Mata_Kuliah ASC");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("GET Mata Kuliah Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), {
      status: 401,
    });
  }
}
