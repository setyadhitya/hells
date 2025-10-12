// app/api/assisten/route.js
import mysql from "mysql2/promise";
import { secureHandler } from "../../../lib/secureApi"; // ✅ Gunakan middleware keamanan

// 🔹 Fungsi koneksi database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 GET — Ambil data profil asisten ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,  // ✅ hanya user login yang boleh akses
    rateLimit: true,    // ✅ batasi request per menit
    handler: async ({ user, ip, logAudit }) => {
      // 🔹 Pastikan role sesuai
      if (user.role !== "assisten") {
        return new Response(
          JSON.stringify({ error: "Akses hanya untuk asisten" }),
          { status: 403 }
        );
      }

      const conn = await getConnection();

      // 🔹 Ambil data berdasarkan username dari token
      const [rows] = await conn.execute(
        "SELECT id, username, nama, nim, nomorhp, status FROM tb_assisten WHERE username = ?",
        [user.username]
      );
      await conn.end();

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Data asisten tidak ditemukan" }),
          { status: 404 }
        );
      }

      const asisten = rows[0];

      // 🪵 Catat aktivitas
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "get_profile_assisten",
        ip,
      });

      return new Response(JSON.stringify(asisten), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
}
