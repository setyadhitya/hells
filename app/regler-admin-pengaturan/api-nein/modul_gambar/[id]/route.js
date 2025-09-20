// app/regler-admin-pengaturan/api/modul_gambar/[id]/route.js
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

// PUT update data
export async function PUT(req, { params }) {
  try {
    const id = params.id;
    const formData = await req.formData();
    const halaman_id = formData.get("halaman_id");
    const keterangan = formData.get("keterangan") || "";

    let filePath = null;
    const file = formData.get("file");

    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      filePath = `/uploads/${Date.now()}_${file.name}`;
      fs.writeFileSync(path.join(process.cwd(), "public", filePath), buffer);
    }

    const db = await getConnection();
    if (filePath) {
      await db.execute(
        `UPDATE tb_modul_gambar SET halaman_id=?, path_gambar=?, keterangan=? WHERE id=?`,
        [halaman_id, filePath, keterangan, id]
      );
    } else {
      await db.execute(
        `UPDATE tb_modul_gambar SET halaman_id=?, keterangan=? WHERE id=?`,
        [halaman_id, keterangan, id]
      );
    }

   const [updated] = await db.execute(`
  SELECT 
    mg.*, 
    h.nomor_halaman, 
    m.judul AS judul_modul, 
    h.modul_id
  FROM tb_modul_gambar mg
  JOIN tb_modul_halaman h ON mg.halaman_id = h.id
  JOIN tb_modul m ON h.modul_id = m.id
  WHERE mg.id=?
`, [id]);


    return NextResponse.json(updated[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE hapus data
export async function DELETE(req, { params }) {
  try {
    const id = params.id;
    const db = await getConnection();

    const [rows] = await db.execute(
      `SELECT path_gambar FROM tb_modul_gambar WHERE id=?`,
      [id]
    );
    if (rows.length > 0 && rows[0].path_gambar) {
      const filePath = path.join(process.cwd(), "public", rows[0].path_gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.execute(`DELETE FROM tb_modul_gambar WHERE id=?`, [id]);
    await db.end();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
