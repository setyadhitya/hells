// app/api/kode_presensi/presensi_status/route.js
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

// ==================== 🔹 GET — Status kode presensi terakhir ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
      if (user.role !== "assisten") {
        return new Response(JSON.stringify({ error: "Hanya asisten yang bisa melihat status" }), { status: 403 });
      }

      const conn = await getConnection();
      const [rows] = await conn.execute(
        `SELECT kp.*, mk.mata_kuliah
         FROM tb_kode_presensi kp
         JOIN tb_praktikum mk ON kp.praktikum_id = mk.id
         WHERE kp.generated_by_assisten_id = ?
         ORDER BY kp.id DESC LIMIT 1`,
        [user.id]
      );

      if (rows.length === 0) {
        await conn.end();
        return new Response(JSON.stringify({ message: "Belum ada kode presensi." }), { status: 404 });
      }

      const kode = rows[0];
      const created = new Date(kode.created_at);
      const now = new Date();
      const selisihMenit = (now - created) / 60000;

      let status = kode.status;
      if (selisihMenit > 10 && status === "aktif") {
        status = "expired";
        await conn.execute(`UPDATE tb_kode_presensi SET status='expired' WHERE id=?`, [kode.id]);
      }

      await conn.end();

      await logAudit({
        userId: user.id,
        username: user.username,
        action: "check_kode_presensi_status",
        ip,
      });

      return new Response(
        JSON.stringify({
          ...kode,
          status,
          selisihMenit,
        }),
        { status: 200 }
      );
    },
  });
}
