// app/api/admin/praktikum/route.js
import { secureHandler } from "../../../../lib/secureApi";
import mysql from "mysql2/promise";

// 🔹 Fungsi koneksi ke database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 GET — Ambil semua praktikum ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM tb_praktikum");
      await conn.end();

      // Audit log (read saja bisa dicatat atau di-skip)
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "read_praktikum",
        ip,
      });

      return rows;
    },
  });
}

// ==================== 🔹 POST — Tambah praktikum baru ====================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
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

      await conn.end();

      // Audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "create_praktikum",
        ip,
        meta: { id: result.insertId, mata_kuliah, kelas },
      });

      return { message: "praktikum & jadwal berhasil ditambahkan", id: result.insertId };
    },
  });
}

// ==================== 🔹 PUT — Update praktikum ====================
export async function PUT(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
      if (!["admin", "laboran"].includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const body = await req.json();
      const {
        id, mata_kuliah, jurusan, kelas, semester,
        hari, jam_mulai, jam_ahir, shift, assisten, catatan
      } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: "ID wajib dikirim" }), { status: 400 });
      }

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

      // Audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "update_praktikum",
        ip,
        meta: { id, mata_kuliah, kelas },
      });

      return { message: "praktikum berhasil diperbarui" };
    },
  });
}

// ==================== 🔹 DELETE — Hapus praktikum ====================
export async function DELETE(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
      if (!["admin", "laboran"].includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

      const conn = await getConnection();

      // Hapus dulu semua jadwal yang berelasi
      await conn.execute("DELETE FROM tb_jadwal WHERE praktikum_id = ?", [id]);

      // Hapus data praktikum
      const [result] = await conn.execute("DELETE FROM tb_praktikum WHERE id = ?", [id]);

      await conn.end();

      if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: "Data not found" }), { status: 404 });
      }

      // Audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "delete_praktikum",
        ip,
        meta: { id },
      });

      return { success: true, message: "Praktikum & jadwal terkait dihapus" };
    },
  });
}
