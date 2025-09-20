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

// GET semua modul
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_modul ORDER BY id DESC");
    await conn.end();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET modul error:", err);
    return NextResponse.json({ error: "Gagal ambil data modul" }, { status: 500 });
  }
}

// POST tambah modul
export async function POST(req) {
  try {
    const { judul, deskripsi } = await req.json();

    const conn = await getConnection();
    const [result] = await conn.execute(
      "INSERT INTO tb_modul (judul, deskripsi) VALUES (?, ?)",
      [judul, deskripsi]
    );
    await conn.end();

    return NextResponse.json({ message: "Modul berhasil ditambahkan", id: result.insertId });
  } catch (err) {
    console.error("POST modul error:", err);
    return NextResponse.json({ error: "Gagal tambah modul" }, { status: 500 });
  }
}
