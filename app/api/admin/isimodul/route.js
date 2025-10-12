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

async function fileToBuffer(file) {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes);
}

async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// ===================================================
// 🔹 GET semua isi modul / detail by ID
// ===================================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();

    if (id) {
      const [rows] = await conn.query(
        `
        SELECT 
          i.id, 
          i.modul_id,
          i.halaman, 
          i.gambar, 
          i.deskripsi,
          m.mata_kuliah,
          m.pertemuan,
          m.materi
        FROM tb_isimodul i
        LEFT JOIN tb_modul m ON i.modul_id = m.id
        WHERE i.id = ?
      `,
        [id]
      );
      await conn.end();

      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
      }

      return Response.json(rows[0]);
    }

    // Ambil semua isi modul
    const [rows] = await conn.query(`
      SELECT 
        i.id, 
        i.modul_id,
        i.halaman, 
        i.gambar, 
        i.deskripsi,
        m.mata_kuliah,
        m.pertemuan,
        m.materi
      FROM tb_isimodul i
      LEFT JOIN tb_modul m ON i.modul_id = m.id
      ORDER BY m.mata_kuliah ASC, CAST(SUBSTRING_INDEX(m.pertemuan, ' ', -1) AS UNSIGNED), i.halaman ASC
    `);

    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("❌ GET Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// ===================================================
// 🔹 POST tambah isi modul baru
// ===================================================
export async function POST(req) {
  try {
    const user = await auth(req);
    if (!user || !["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const formData = await req.formData();
    const modul_id = formData.get("modul_id");
    const halaman = formData.get("halaman");
    const deskripsi = formData.get("deskripsi");
    const file = formData.get("gambar");

    const conn = await getConnection();

    // ✅ Cegah duplikasi modul_id + halaman
    const [exists] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM tb_isimodul WHERE modul_id = ? AND halaman = ?",
      [modul_id, halaman]
    );
    if (exists[0].cnt > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Halaman ${halaman} untuk modul ini sudah ada.` }),
        { status: 400 }
      );
    }

    // ✅ Upload gambar jika ada
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

    await conn.execute(
      "INSERT INTO tb_isimodul (modul_id, halaman, gambar, deskripsi) VALUES (?, ?, ?, ?)",
      [modul_id, halaman, filePath, deskripsi]
    );

    await conn.end();
    return Response.json({ message: "Isi modul ditambahkan" });
  } catch (err) {
    console.error("❌ POST Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// ===================================================
// 🔹 PUT update isi modul
// ===================================================
export async function PUT(req) {
  try {
    const user = await auth(req);
    if (!user || !["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const formData = await req.formData();
    const id = formData.get("id");
    const modul_id = formData.get("modul_id");
    const halaman = formData.get("halaman");
    const deskripsi = formData.get("deskripsi");
    const file = formData.get("gambar");

    const conn = await getConnection();
    const [[old]] = await conn.query("SELECT * FROM tb_isimodul WHERE id=?", [id]);
    if (!old) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
    }

    // ✅ Cegah duplikasi modul_id + halaman (selain ID sendiri)
    const [dupe] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM tb_isimodul WHERE modul_id=? AND halaman=? AND id!=?",
      [modul_id, halaman, id]
    );
    if (dupe[0].cnt > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Halaman ${halaman} untuk modul ini sudah ada.` }),
        { status: 400 }
      );
    }

    let filePath = old.gambar;

    // ✅ Upload file baru jika ada
    if (file && file.name) {
      if (old.gambar) {
        const oldPath = path.join(process.cwd(), "public", old.gambar);
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
      "UPDATE tb_isimodul SET modul_id=?, halaman=?, gambar=?, deskripsi=? WHERE id=?",
      [modul_id, halaman, filePath, deskripsi, id]
    );
    await conn.end();

    return Response.json({ message: "Isi modul diperbarui" });
  } catch (err) {
    console.error("❌ PUT Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// ===================================================
// 🔹 DELETE hapus isi modul
// ===================================================
export async function DELETE(req) {
  try {
    const user = await auth(req);
    if (!user || !["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();
    const [[old]] = await conn.query("SELECT * FROM tb_isimodul WHERE id=?", [id]);
    if (!old) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
    }

    if (old.gambar) {
      const oldPath = path.join(process.cwd(), "public", old.gambar);
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
