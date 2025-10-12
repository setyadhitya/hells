// app/api/kode_presensi/route.js
import mysql from "mysql2/promise";
import { secureHandler } from "../../../lib/secureApi";

// 🔹 Koneksi DB
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 POST — Buat kode presensi ====================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ req, user, ip, logAudit }) => {
      // ✅ Periksa role (case-insensitive)
      if (user.role?.toLowerCase() !== "assisten") {
        return new Response(
          JSON.stringify({ error: "Akses ditolak, hanya asisten yang boleh membuat kode" }),
          { status: 403 }
        );
      }

      const { mata_kuliah_id, pertemuan_ke, materi, kode } = await req.json();
      if (!mata_kuliah_id || !pertemuan_ke || !materi || !kode) {
        return new Response(JSON.stringify({ error: "Semua field wajib diisi" }), { status: 400 });
      }

      const conn = await getConnection();

      // 🔎 Cek duplikasi
      const [cek] = await conn.execute(
        "SELECT id FROM tb_kode_presensi WHERE mata_kuliah_id=? AND pertemuan_ke=?",
        [mata_kuliah_id, pertemuan_ke]
      );

      if (cek.length > 0) {
        await conn.end();
        return new Response(
          JSON.stringify({ error: "Kode presensi untuk pertemuan ini sudah ada" }),
          { status: 409 }
        );
      }

      // 💾 Simpan data
      const [result] = await conn.execute(
        `INSERT INTO tb_kode_presensi 
         (mata_kuliah_id, pertemuan_ke, materi, kode, generated_by_assisten_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'aktif', NOW())`,
        [mata_kuliah_id, pertemuan_ke, materi, kode, user.id]
      );

      await conn.end();

      // 🪵 Audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "create_kode_presensi",
        ip,
        meta: { mata_kuliah_id, pertemuan_ke, kode },
      });

      return new Response(
        JSON.stringify({ message: "Kode presensi berhasil dibuat", id: result.insertId }),
        { status: 200 }
      );
    },
  });
}
