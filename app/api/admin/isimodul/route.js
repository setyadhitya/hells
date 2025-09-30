import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { verifyToken } from "../../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔹 Helper konversi file ke buffer
async function fileToBuffer(file) {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes);
}

// 🔹 Middleware auth
async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// 🔹 GET: list semua isi modul / detail by id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();

    if (id) {
      const [rows] = await conn.query("SELECT * FROM tb_isimodul WHERE id=?", [id]);
      await conn.end();
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
          status: 404,
        });
      }
      return Response.json(rows[0]);
    }

    const [rows] = await conn.query(`
      SELECT i.id, i.mata_kuliah, i.pertemuan, i.gambar, i.deskripsi, i.halaman,
             m.pertemuan AS pertemuan_label
      FROM tb_isimodul i
      LEFT JOIN tb_modul m 
        ON i.mata_kuliah = m.mata_kuliah AND i.pertemuan = m.pertemuan
      ORDER BY i.id DESC
    `);

    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("❌ GET Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 🔹 POST: tambah isi modul baru
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
    const halaman = formData.get("halaman");

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
      `INSERT INTO tb_isimodul (mata_kuliah, pertemuan, gambar, deskripsi, halaman) 
       VALUES (?,?,?,?,?)`,
      [mata_kuliah, pertemuan, filePath, deskripsi, halaman]
    );
    await conn.end();

    return Response.json({ message: "Isi modul ditambahkan", id: result.insertId });
  } catch (err) {
    console.error("❌ POST Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 🔹 PUT: update isi modul
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
    const halaman = formData.get("halaman");

    const conn = await getConnection();
    const [[oldData]] = await conn.query("SELECT * FROM tb_isimodul WHERE id=?", [id]);

    if (!oldData) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
    }

    let filePath = oldData.gambar;

    if (file && file.name) {
      if (oldData.gambar) {
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
      `UPDATE tb_isimodul 
       SET mata_kuliah=?, pertemuan=?, gambar=?, deskripsi=?, halaman=? 
       WHERE id=?`,
      [mata_kuliah, pertemuan, filePath, deskripsi, halaman, id]
    );
    await conn.end();

    return Response.json({ message: "Isi modul diupdate" });
  } catch (err) {
    console.error("❌ PUT Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 🔹 DELETE: hapus isi modul
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

    if (!oldData) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
    }

    if (oldData.gambar) {
      const oldPath = path.join(process.cwd(), "public", oldData.gambar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await conn.execute("DELETE FROM tb_isimodul WHERE id=?", [id]);
    await conn.end();

    return Response.json({ message: "Isi modul dihapus" });
  } catch (err) {
    console.error("❌ DELETE Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
