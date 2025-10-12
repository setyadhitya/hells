// app/api/kode_presensi/expire/route.js
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

// ==================== 🔹 POST — Expire kode presensi aktif ====================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user, logAudit, ip }) => {
      if (user.role !== "assisten") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const conn = await getConnection();
      await conn.execute(
        `UPDATE tb_kode_presensi 
         SET status='expired' 
         WHERE generated_by_assisten_id=? AND status='aktif'`,
        [user.id]
      );
      await conn.end();

      await logAudit({
        userId: user.id,
        username: user.username,
        action: "expire_kode_presensi",
        ip,
      });

      return new Response(JSON.stringify({ message: "Kode presensi telah di-expire" }), { status: 200 });
    },
  });
}
