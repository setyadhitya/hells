import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// GET modul by id
export async function GET(req, { params }) {
  const { id } = params;
  const conn = await getConnection();
  const [rows] = await conn.execute("SELECT * FROM tb_modul WHERE id = ?", [id]);
  await conn.end();
  return NextResponse.json(rows[0] || {});
}

// PUT update modul
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { judul, deskripsi } = await req.json();

    const conn = await getConnection();
    await conn.execute("UPDATE tb_modul SET judul=?, deskripsi=? WHERE id=?", [
      judul,
      deskripsi,
      id,
    ]);
    await conn.end();

    return NextResponse.json({ message: "Modul berhasil diperbarui" });
  } catch (err) {
    console.error("PUT modul error:", err);
    return NextResponse.json({ error: "Gagal update modul" }, { status: 500 });
  }
}

// DELETE modul
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const conn = await getConnection();
    await conn.execute("DELETE FROM tb_modul WHERE id=?", [id]);
    await conn.end();

    return NextResponse.json({ message: "Modul berhasil dihapus" });
  } catch (err) {
    console.error("DELETE modul error:", err);
    return NextResponse.json({ error: "Gagal hapus modul" }, { status: 500 });
  }
}
