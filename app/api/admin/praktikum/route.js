// app/api/admin/praktikum/route.js
import mysql from "mysql2/promise";
import { verifyToken } from "../../../../lib/auth";

// 🔹 Fungsi koneksi ke database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔹 Middleware: validasi token dan user
async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// ==================== 🔹 GET ====================
export async function GET(req) {
  try {
    await auth(req);
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_praktikum");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unauthorized" }),
      { status: 401 }
    );
  }
}

// ==================== 🔹 POST ====================
export async function POST(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const {
      mata_kuliah, jurusan, kelas, semester,
      hari, jam_mulai, jam_ahir, shift,
      assisten, catatan
    } = body;

    const conn = await getConnection();

    // Cek duplikasi praktikum
    const [duplikasi] = await conn.execute(
      "SELECT id FROM tb_praktikum WHERE mata_kuliah=? AND kelas=?",
      [mata_kuliah, kelas]
    );
    if (duplikasi.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `praktikum ${mata_kuliah} untuk kelas ${kelas} sudah ada` }),
        { status: 400 }
      );
    }

    // Cek bentrok shift
    const [bentrok] = await conn.execute(
      "SELECT id FROM tb_praktikum WHERE hari=? AND shift=?",
      [hari, shift]
    );
    if (bentrok.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Sudah ada praktikum di hari ${hari}, shift ${shift}` }),
        { status: 400 }
      );
    }

    // Tambah praktikum baru
    const [result] = await conn.execute(
      `INSERT INTO tb_praktikum 
        (mata_kuliah, jurusan, kelas, semester, hari, jam_mulai, jam_ahir, shift, assisten, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [mata_kuliah, jurusan, kelas, semester, hari, jam_mulai, jam_ahir, shift, assisten, catatan]
    );
    const newId = result.insertId;


    await conn.end();
    return Response.json({ message: "praktikum & jadwal berhasil ditambahkan", id: newId });
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unauthorized" }),
      { status: 401 }
    );
  }
}

// ==================== 🔹 PUT ====================
export async function PUT(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const {
      id, mata_kuliah, jurusan, kelas, semester,
      hari, jam_mulai, jam_ahir, shift, assisten, catatan
    } = body;

    const conn = await getConnection();

    // Cek duplikasi
    const [duplikasi] = await conn.execute(
      "SELECT id FROM tb_praktikum WHERE mata_kuliah=? AND kelas=? AND id!=?",
      [mata_kuliah, kelas, id]
    );
    if (duplikasi.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `praktikum ${mata_kuliah} untuk kelas ${kelas} sudah ada` }),
        { status: 400 }
      );
    }

    // Cek bentrok shift
    const [bentrok] = await conn.execute(
      "SELECT id FROM tb_praktikum WHERE hari=? AND shift=? AND id!=?",
      [hari, shift, id]
    );
    if (bentrok.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Sudah ada praktikum di hari ${hari}, shift ${shift}` }),
        { status: 400 }
      );
    }

    // Update data
    await conn.execute(
      `UPDATE tb_praktikum
       SET mata_kuliah=?, jurusan=?, kelas=?, semester=?, hari=?, 
           jam_mulai=?, jam_ahir=?, shift=?, assisten=?, catatan=?
       WHERE id=?`,
      [mata_kuliah, jurusan, kelas, semester, hari, jam_mulai, jam_ahir, shift, assisten, catatan, id]
    );

    await conn.end();
    return Response.json({ message: "praktikum berhasil diperbarui" });
  } catch (err) {
    console.error("PUT Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unauthorized" }),
      { status: 401 }
    );
  }
}

// ✅ DELETE PRAKTIKUM
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    const db = await getConnection();

    // 🔹 Hapus dulu semua jadwal yang berelasi
    await db.execute("DELETE FROM tb_jadwal WHERE id = ?", [id]);

    // 🔹 Baru hapus data praktikum
    const [result] = await db.execute("DELETE FROM tb_praktikum WHERE id = ?", [id]);

    await db.end();

    if (result.affectedRows === 0)
      return Response.json({ error: "Data not found" }, { status: 404 });

    return Response.json({ success: true, message: "Praktikum & jadwal terkait dihapus" });
  } catch (err) {
    console.error("🔥 ERROR DELETE PRAKTIKUM:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

