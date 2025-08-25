import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_modul",
  });
}

// GET semua data gambar
export async function GET() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT g.id, g.modul_id, m.judul AS modul_judul, g.halaman_id, h.nomor_halaman, g.gambar_path, g.keterangan
     FROM tb_modul_gambar g
     JOIN tb_modul m ON g.modul_id = m.id
     JOIN tb_modul_halaman h ON g.halaman_id = h.id
     ORDER BY g.id DESC`
  );
  await conn.end();
  return NextResponse.json(rows);
}

// POST tambah data gambar
export async function POST(req) {
  const formData = await req.formData();
  const modul_id = formData.get("modul_id");
  const halaman_id = formData.get("halaman_id");
  const keterangan = formData.get("keterangan");
  const file = formData.get("gambar");

  if (!file || !file.name) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
    return NextResponse.json({ error: "Format file harus jpg/jpeg/png" }, { status: 400 });
  }

  // simpan file ke public/uploads/gambar-modul/
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = Date.now() + ext;
  const filepath = path.join(process.cwd(), "app/regler-admin-pengaturan/public/uploads/gambar-modul", filename);

  await writeFile(filepath, buffer);

  const conn = await getConnection();
  await conn.execute(
    "INSERT INTO tb_modul_gambar (modul_id, halaman_id, gambar_path, keterangan) VALUES (?, ?, ?, ?)",
    [modul_id, halaman_id, `/uploads/gambar-modul/${filename}`, keterangan]
  );
  await conn.end();

  return NextResponse.json({ message: "Gambar berhasil disimpan" });
}
