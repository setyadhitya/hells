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
  const token = cookies().get("token")?.value;
  if (!token) return new Response(JSON.stringify({ message: "unauthorized" }), { status: 403 });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    if (!data || data.role !== "admin") {
      return new Response(JSON.stringify({ message: "only admin allowed" }), { status: 403 });
    }
  } catch {
    return new Response(JSON.stringify({ message: "unauthorized" }), { status: 403 });
  }

  const { username, password, role } = await req.json();
  if (!username || !password || !role) {
    return new Response(JSON.stringify({ message: "missing fields" }), { status: 400 });
  }

  try {
    const conn = await getConnection();
    const hash = await bcrypt.hash(password, 10);
    await conn.execute("INSERT INTO tb_users (username, role, password_hash) VALUES (?, ?, ?)", [
      username,
      role,
      hash,
    ]);
    await conn.end();
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "error creating user" }), { status: 500 });
  }
}
