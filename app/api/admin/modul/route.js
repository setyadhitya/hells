import mysql from "mysql2/promise";
import { verifyToken } from "../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern", // sesuaikan
  });
}

// 🔹 Middleware helper untuk cek token
async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// 🔹 GET semua modul
export async function GET(req) {
  try {
    await auth(req); // cek token
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_modul ORDER BY id DESC");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), {
      status: 401,
    });
  }
}

// 🔹 POST tambah modul (admin/laboran saja)
export async function POST(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const { judul, deskripsi } = body;

    const conn = await getConnection();
    const [result] = await conn.execute(
      "INSERT INTO tb_modul (judul, deskripsi) VALUES (?, ?)",
      [judul, deskripsi]
    );
    await conn.end();

    return Response.json({ message: "Modul berhasil ditambahkan", id: result.insertId });
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), {
      status: 401,
    });
  }
}

// 🔹 PUT update modul
export async function PUT(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const { id, judul, deskripsi } = body;

    const conn = await getConnection();
    await conn.execute(
      "UPDATE tb_modul SET judul=?, deskripsi=? WHERE id=?",
      [judul, deskripsi, id]
    );
    await conn.end();

    return Response.json({ message: "Modul berhasil diperbarui" });
  } catch (err) {
    console.error("PUT Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), {
      status: 401,
    });
  }
}

// 🔹 DELETE hapus modul
export async function DELETE(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();
    await conn.execute("DELETE FROM tb_modul WHERE id=?", [id]);
    await conn.end();

    return Response.json({ message: "Modul berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), {
      status: 401,
    });
  }
}
