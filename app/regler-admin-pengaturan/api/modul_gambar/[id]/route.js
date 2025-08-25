import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_modul",
  });
}

// GET by ID
export async function GET(req, { params }) {
  const { id } = params;
  const conn = await getConnection();
  const [rows] = await conn.execute("SELECT * FROM tb_modul_gambar WHERE id=?", [id]);
  await conn.end();

  if (rows.length === 0) {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

// PUT update data
export async function PUT(req, { params }) {
  const { id } = params;
  const formData = await req.formData();
  const modul_id = formData.get("modul_id");
  const halaman_id = formData.get("halaman_id");
  const keterangan = formData.get("keterangan");
  const file = formData.get("gambar");

  let gambarPath = null;

  if (file && file.name) {
    const ext = path.extname(file.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return NextResponse.json({ error: "Format file harus jpg/jpeg/png" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = Date.now() + ext;
    const filepath = path.join(process.cwd(), "app/regler-admin-pengaturan/public/uploads/gambar-modul", filename);
    await fs.promises.writeFile(filepath, buffer);
    gambarPath = `/uploads/gambar-modul/${filename}`;
  }

  const conn = await getConnection();
  if (gambarPath) {
    await conn.execute(
      "UPDATE tb_modul_gambar SET modul_id=?, halaman_id=?, gambar_path=?, keterangan=? WHERE id=?",
      [modul_id, halaman_id, gambarPath, keterangan, id]
    );
  } else {
    await conn.execute(
      "UPDATE tb_modul_gambar SET modul_id=?, halaman_id=?, keterangan=? WHERE id=?",
      [modul_id, halaman_id, keterangan, id]
    );
  }
  await conn.end();

  return NextResponse.json({ message: "Data berhasil diperbarui" });
}

// DELETE data
export async function DELETE(req, { params }) {
  const { id } = params;
  const conn = await getConnection();

  const [rows] = await conn.execute("SELECT gambar_path FROM tb_modul_gambar WHERE id=?", [id]);
  if (rows.length > 0) {
    const filePath = path.join(process.cwd(), "app/regler-admin-pengaturan/public", rows[0].gambar_path);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath); // hapus file fisik
    }
  }

  await conn.execute("DELETE FROM tb_modul_gambar WHERE id=?", [id]);
  await conn.end();

  return NextResponse.json({ message: "Data berhasil dihapus" });
}
