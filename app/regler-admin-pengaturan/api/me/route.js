import mysql from "mysql2/promise";
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

export async function GET() {
  const token = cookies().get("token")?.value;
  if (!token) return Response.json({ ok: false });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT id, username, role FROM tb_users WHERE id = ?", [data.id]);
    await conn.end();

    const user = rows[0];
    if (!user) return Response.json({ ok: false });

    return Response.json({ ok: true, user });
  } catch (e) {
    return Response.json({ ok: false });
  }
}
