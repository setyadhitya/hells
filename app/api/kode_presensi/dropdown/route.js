// app/api/kode_presensi/dropdown/route.js
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

// ==================== 🔹 GET — Ambil daftar mata kuliah asisten ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user }) => {
      // ✅ Hanya role assisten yang boleh ambil data ini
      if (user.role !== "assisten") {
        return new Response(
          JSON.stringify({ error: "Akses ditolak. Hanya asisten yang diizinkan." }),
          { status: 403 }
        );
      }

      const conn = await getConnection();

      // 🔹 Ambil data dari tb_assisten_praktikum, JOIN ke tb_praktikum
      const [rows] = await conn.execute(
        `
        SELECT 
          ap.praktikum_id AS id,
          p.mata_kuliah
        FROM tb_assisten_praktikum ap
        JOIN tb_praktikum p ON ap.praktikum_id = p.id
        JOIN tb_assisten a ON ap.assisten_id = a.id
        WHERE a.username = ?
        ORDER BY p.mata_kuliah ASC
        `,
        [user.username]
      );

      await conn.end();

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Tidak ada praktikum yang terdaftar untuk asisten ini." }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(rows), { status: 200 });
    },
  });
}
