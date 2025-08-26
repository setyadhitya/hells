// app/regler-admin-pengaturan/api/modul_gambar/route.js
import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// GET semua data
export async function GET() {
  try {
    const db = await getConnection();
    const [rows] = await db.execute(`
      SELECT 
        mg.*, 
        h.nomor_halaman, 
        m.judul AS judul_modul, 
        h.modul_id
      FROM tb_modul_gambar mg
      JOIN tb_modul_halaman h ON mg.halaman_id = h.id
      JOIN tb_modul m ON h.modul_id = m.id
      ORDER BY mg.id DESC
    `);
    await db.end();

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST tambah data
export async function POST(req) {
  try {
    const formData = await req.formData();
    const halaman_id = formData.get("halaman_id");
    const keterangan = formData.get("keterangan") || "";

    // simpan file
    const file = formData.get("file"); // ⚠️ harus sama dengan client
    let filePath = "";

    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      filePath = `/uploads/${Date.now()}_${file.name}`;
      fs.writeFileSync(path.join(process.cwd(), "public", filePath), buffer);
    }

    const db = await getConnection();
    const [result] = await db.execute(
      `INSERT INTO tb_modul_gambar (halaman_id, path_gambar, keterangan) VALUES (?, ?, ?)`,
      [halaman_id, filePath, keterangan]
    );

    const [newData] = await db.execute(`
  SELECT 
    mg.*, 
    h.nomor_halaman, 
    m.judul AS judul_modul, 
    h.modul_id
  FROM tb_modul_gambar mg
  JOIN tb_modul_halaman h ON mg.halaman_id = h.id
  JOIN tb_modul m ON h.modul_id = m.id
  WHERE mg.id=?
`, [result.insertId]);


    return NextResponse.json(newData[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
