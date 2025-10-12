// app/api/admin/peserta_kuliah/route.js
import mysql from "mysql2/promise";
import { secureHandler } from "../../../../lib/secureApi";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 GET — Ambil daftar peserta ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
      const db = await getConnection();
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          pr.nama AS praktikan,
          k.mata_kuliah AS praktikum,
          p.created_at
        FROM tb_peserta p
        JOIN tb_praktikan pr ON pr.id = p.praktikan_id
        JOIN tb_praktikum k ON k.id = p.praktikum_id
        ORDER BY p.id DESC
      `);
      await db.end();

      // Catat aktivitas (opsional)
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "read_peserta",
        ip,
      });

      return rows;
    },
  });
}

// ==================== 🔹 POST — Tambah peserta ====================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ req, user, ip, logAudit }) => {
      const body = await req.json();

      if (!Array.isArray(body) || body.length === 0) {
        return new Response(JSON.stringify({ error: "Data tidak valid" }), { status: 400 });
      }

      const db = await getConnection();
      let inserted = 0;

      for (const item of body) {
        const { praktikan_id, praktikum_id } = item;
        if (!praktikan_id || !praktikum_id) continue;

        const [cek] = await db.execute(
          "SELECT id FROM tb_peserta WHERE praktikan_id=? AND praktikum_id=?",
          [praktikan_id, praktikum_id]
        );

        if (cek.length === 0) {
          await db.execute(
            "INSERT INTO tb_peserta (praktikan_id, praktikum_id, created_at) VALUES (?, ?, NOW())",
            [praktikan_id, praktikum_id]
          );
          inserted++;
        }
      }

      await db.end();

      // Audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "create_peserta",
        ip,
        meta: { jumlah: inserted },
      });

      return { message: `Peserta berhasil ditambahkan (${inserted} data)` };
    },
  });
}

// ==================== 🔹 PUT — Update peserta ====================
export async function PUT(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ req, user, ip, logAudit }) => {
      const { id, praktikan_id, praktikum_id } = await req.json();
      if (!id || !praktikan_id || !praktikum_id) {
        return new Response(JSON.stringify({ error: "Data tidak lengkap" }), { status: 400 });
      }

      const db = await getConnection();
      await db.execute(
        "UPDATE tb_peserta SET praktikan_id=?, praktikum_id=? WHERE id=?",
        [praktikan_id, praktikum_id, id]
      );
      await db.end();

      await logAudit({
        userId: user.id,
        username: user.username,
        action: "update_peserta",
        ip,
        meta: { id, praktikan_id, praktikum_id },
      });

      return { message: "Peserta berhasil diperbarui" };
    },
  });
}

// ==================== 🔹 DELETE — Hapus peserta ====================
export async function DELETE(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ req, user, ip, logAudit }) => {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) return new Response(JSON.stringify({ error: "ID tidak dikirim" }), { status: 400 });

      const db = await getConnection();
      await db.execute("DELETE FROM tb_peserta WHERE id=?", [id]);
      await db.end();

      await logAudit({
        userId: user.id,
        username: user.username,
        action: "delete_peserta",
        ip,
        meta: { id },
      });

      return { message: "Peserta berhasil dihapus" };
    },
  });
}
