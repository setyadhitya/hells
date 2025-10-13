// app/api/akun_assisten/dropdown/route.js
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

// ==================== 🔹 GET — Ambil daftar praktikum milik asisten ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user }) => {
      // ✅ Pastikan hanya asisten yang bisa akses
      if (user.role !== "assisten") {
        return new Response(
          JSON.stringify({ error: "Akses ditolak — hanya asisten yang dapat melihat data ini." }),
          { status: 403 }
        );
      }

      const conn = await getConnection();

      // 🔹 Ambil daftar praktikum yang diampu asisten
      const [rows] = await conn.execute(
        `
        SELECT 
          ap.id AS id_relasi,
          p.id AS id,
          p.mata_kuliah
        FROM tb_assisten_praktikum ap
        JOIN tb_praktikum p ON ap.praktikum_id = p.id
        WHERE ap.assisten_id = ?
        ORDER BY p.mata_kuliah ASC
        `,
        [user.id]
      );

      await conn.end();

      // Jika asisten belum mengampu apa pun
      if (rows.length === 0) {
        return new Response(
          JSON.stringify({
            matkul: [],
            message: "Kamu belum terdaftar sebagai asisten pada praktikum mana pun.",
          }),
          { status: 200 }
        );
      }

      // Jika ada data
      return new Response(JSON.stringify({ matkul: rows }), { status: 200 });
    },
  });
}
