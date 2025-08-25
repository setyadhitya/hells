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

// GET detail halaman by ID
export async function GET(req, { params }) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM tb_halaman WHERE id = ?",
      [params.id]
    );
    await conn.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET halaman error:", err);
    return NextResponse.json({ error: "Gagal ambil data halaman" }, { status: 500 });
  }
}

// UPDATE halaman by ID
export async function PUT(req, { params }) {
  try {
    const { modul_id, nomor_halaman, isi } = await req.json();
    const conn = await getConnection();

    const [result] = await conn.execute(
      "UPDATE tb_halaman SET modul_id = ?, nomor_halaman = ?, isi = ? WHERE id = ?",
      [modul_id, nomor_halaman, isi, params.id]
    );
    await conn.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Halaman berhasil diperbarui" });
  } catch (err) {
    console.error("PUT halaman error:", err);
    return NextResponse.json({ error: "Gagal update halaman" }, { status: 500 });
  }
}

// DELETE halaman by ID
export async function DELETE(req, { params }) {
  try {
    const conn = await getConnection();
    const [result] = await conn.execute("DELETE FROM tb_halaman WHERE id = ?", [
      params.id,
    ]);
    await conn.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Halaman berhasil dihapus" });
  } catch (err) {
    console.error("DELETE halaman error:", err);
    return NextResponse.json({ error: "Gagal hapus halaman" }, { status: 500 });
  }
}
