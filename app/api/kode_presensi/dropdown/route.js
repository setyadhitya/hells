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

// ==================== 🔹 GET — Ambil daftar mata kuliah ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user }) => {
      if (user.role !== "assisten") {
        return new Response(JSON.stringify({ error: "Akses ditolak" }), { status: 403 });
      }

      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT id, mata_kuliah FROM tb_praktikum ORDER BY mata_kuliah ASC");
      await conn.end();

      return new Response(JSON.stringify(rows), { status: 200 });
    },
  });
}
