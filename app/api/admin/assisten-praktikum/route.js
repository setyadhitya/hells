// app/api/admin/assisten-praktikum/route.js
import { secureHandler } from "../../../../lib/secureApi";
import mysql from "mysql2/promise";

// 🔹 Koneksi ke database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ========================
// 🔹 GET — Ambil semua relasi Asisten ↔ Praktikum
// ========================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    handler: async () => {
      const conn = await getConnection();
      const [rows] = await conn.execute(`
        SELECT 
          ap.id,
          a.id AS assisten_id,
          a.nama AS assisten,
          p.id AS praktikum_id,
          p.mata_kuliah AS praktikum,
          p.kelas
        FROM tb_assisten_praktikum ap
        JOIN tb_assisten a ON ap.assisten_id = a.id
        JOIN tb_praktikum p ON ap.praktikum_id = p.id
        ORDER BY a.nama
      `);
      await conn.end();
      return rows;
    },
  });
}

// ========================
// 🔹 POST — Tambah relasi baru
// ========================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    handler: async ({ user }) => {
      if (!["admin", "laboran"].includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const body = await req.json();
      const { assisten_id, praktikum_id } = body;

      if (!assisten_id || !praktikum_id) {
        return new Response(JSON.stringify({ error: "Data tidak lengkap" }), { status: 400 });
      }

      const conn = await getConnection();

      // Cegah duplikasi
      const [cek] = await conn.execute(
        "SELECT id FROM tb_assisten_praktikum WHERE assisten_id=? AND praktikum_id=?",
        [assisten_id, praktikum_id]
      );
      if (cek.length > 0) {
        await conn.end();
        return new Response(
          JSON.stringify({ error: "Relasi sudah ada" }),
          { status: 400 }
        );
      }

      await conn.execute(
        "INSERT INTO tb_assisten_praktikum (assisten_id, praktikum_id) VALUES (?, ?)",
        [assisten_id, praktikum_id]
      );
      await conn.end();

      return { message: "Relasi berhasil ditambahkan" };
    },
  });
}

// ========================
// 🔹 PUT — Update relasi (Edit)
// ========================
export async function PUT(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    handler: async ({ user }) => {
      if (!["admin", "laboran"].includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const body = await req.json();
      const { id, assisten_id, praktikum_id } = body;

      if (!id || !assisten_id || !praktikum_id) {
        return new Response(
          JSON.stringify({ error: "Data tidak lengkap" }),
          { status: 400 }
        );
      }

      const conn = await getConnection();

      // Cek apakah relasi sudah ada di baris lain
      const [cek] = await conn.execute(
        "SELECT id FROM tb_assisten_praktikum WHERE assisten_id=? AND praktikum_id=? AND id!=?",
        [assisten_id, praktikum_id, id]
      );
      if (cek.length > 0) {
        await conn.end();
        return new Response(
          JSON.stringify({ error: "Relasi tersebut sudah ada di data lain" }),
          { status: 400 }
        );
      }

      // Update data
      const [result] = await conn.execute(
        "UPDATE tb_assisten_praktikum SET assisten_id=?, praktikum_id=? WHERE id=?",
        [assisten_id, praktikum_id, id]
      );
      await conn.end();

      if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
          status: 404,
        });
      }

      return { message: "Relasi berhasil diperbarui" };
    },
  });
}

// ========================
// 🔹 DELETE — Hapus relasi
// ========================
export async function DELETE(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    handler: async ({ user }) => {
      if (!["admin", "laboran"].includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "ID tidak dikirim" }), { status: 400 });
      }

      const conn = await getConnection();
      const [result] = await conn.execute(
        "DELETE FROM tb_assisten_praktikum WHERE id=?",
        [id]
      );
      await conn.end();

      if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
          status: 404,
        });
      }

      return { message: "Relasi berhasil dihapus" };
    },
  });
}
