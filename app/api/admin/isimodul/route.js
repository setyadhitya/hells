import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { auth } from "../../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

function saveFile(file) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "modul");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const fullPath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(new Uint8Array(file.arrayBufferSync ? file.arrayBufferSync() : []));
  fs.writeFileSync(fullPath, buffer);

  return `/uploads/modul/${fileName}`;
}

// Convert File → Buffer
async function fileToBuffer(file) {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes);
}

// GET: list semua isi modul
export async function GET(req) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM tb_isimodul ORDER BY id DESC");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// POST: tambah isi modul baru
export async function POST(req) {
  try {
    const user = await auth(req);
    if (!user || !["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const formData = await req.formData();
    const mata_kuliah = formData.get("mata_kuliah");
    const pertemuan = formData.get("pertemuan");
    const deskripsi = formData.get("deskripsi");
    const file = formData.get("gambar");

    let filePath = null;
    if (file && file.name) {
      const buffer = await fileToBuffer(file);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "modul");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = path.join(uploadDir, fileName);
      fs.writeFileSync(fullPath, buffer);

      filePath = `/uploads/modul/${fileName}`;
    }

    const conn = await getConnection();
    const [result] = await conn.execute(
      `INSERT INTO tb_isimodul (mata_kuliah, pertemuan, gambar, deskripsi) VALUES (?,?,?,?)`,
      [mata_kuliah, pertemuan, filePath, deskripsi]
    );
    await conn.end();

    return Response.json({ message: "Isi modul ditambahkan", id: result.insertId });
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// PUT: update isi modul
export async function PUT(req) {
  try {
    const user = await auth(req);
    if (!user || !["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const formData = await req.formData();
    const id = formData.get("id");
    const mata_kuliah = formData.get("mata_kuliah");
    const pertemuan = formData.get("pertemuan");
    const deskripsi = formData.get("deskripsi");
    const file = formData.get("gambar");

    const conn = await getConnection();
    const [[oldData]] = await conn.query("SELECT * FROM tb_isimodul WHERE id=?", [id]);

    let filePath = oldData?.gambar;

    if (file && file.name) {
      // hapus file lama
      if (oldData?.gambar) {
        const oldPath = path.join(process.cwd(), "public", oldData.gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const buffer = await fileToBuffer(file);
      const uploadDir = path.join(process.cwd(), "public", "uploads", "modul");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = path.join(uploadDir, fileName);
      fs.writeFileSync(fullPath, buffer);

      filePath = `/uploads/modul/${fileName}`;
    }

    await conn.execute(
      `UPDATE tb_isimodul SET mata_kuliah=?, pertemuan=?, gambar=?, deskripsi=? WHERE id=?`,
      [mata_kuliah, pertemuan, filePath, deskripsi, id]
    );
    await conn.end();

    return Response.json({ message: "Isi modul diupdate" });
  } catch (err) {
    console.error("PUT Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// DELETE: hapus isi modul
export async function DELETE(req) {
  try {
    const user = await auth(req);
    if (!user || !["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();
    const [[oldData]] = await conn.query("SELECT * FROM tb_isimodul WHERE id=?", [id]);

    if (oldData?.gambar) {
      const oldPath = path.join(process.cwd(), "public", oldData.gambar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await conn.execute("DELETE FROM tb_isimodul WHERE id=?", [id]);
    await conn.end();

    return Response.json({ message: "Isi modul dihapus" });
  } catch (err) {
    console.error("DELETE Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
