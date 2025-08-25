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

// GET semua halaman (join modul untuk dapat judul)
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT h.id, h.modul_id, m.judul AS modul, 
              h.nomor_halaman, h.isi, h.created_at
       FROM tb_modul_halaman h
       JOIN tb_modul m ON h.modul_id = m.id
       ORDER BY h.id DESC`
    );
    await conn.end();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET halaman error:", err);
    return NextResponse.json(
      { error: "Gagal ambil data halaman" },
      { status: 500 }
    );
  }
}

// POST tambah halaman
export async function POST(req) {
  try {
    const { modul_id, nomor_halaman, isi } = await req.json();

    const conn = await getConnection();
    const [result] = await conn.execute(
      "INSERT INTO tb_modul_halaman (modul_id, nomor_halaman, isi) VALUES (?, ?, ?)",
      [modul_id, nomor_halaman, isi]
    );
    await conn.end();

    return NextResponse.json({
      id: result.insertId,
      modul_id,
      nomor_halaman,
      isi,
    });
  } catch (err) {
    console.error("POST halaman error:", err);
    return NextResponse.json(
      { error: "Gagal tambah halaman" },
      { status: 500 }
    );
  }
}
