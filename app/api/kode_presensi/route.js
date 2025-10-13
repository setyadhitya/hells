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
      // ✅ Hanya role assisten yang boleh buat kode
      if (user.role?.toLowerCase() !== "assisten") {
        return new Response(
          JSON.stringify({
            error: "Akses ditolak, hanya asisten yang boleh membuat kode",
          }),
          { status: 403 }
        );
      }

      const { praktikum_id, pertemuan_ke, materi, kode, lokasi } = await req.json();

      // Validasi wajib
      if (!praktikum_id || !pertemuan_ke || !materi || !kode || !lokasi) {
        return new Response(JSON.stringify({ error: "Semua field wajib diisi" }), { status: 400 });
      }

      const conn = await getConnection();

      // 🔍 1️⃣ Cek apakah ada kode aktif milik asisten ini
      const [aktif] = await conn.execute(
        "SELECT id FROM tb_kode_presensi WHERE generated_by_assisten_id=? AND status='aktif' LIMIT 1",
        [user.id]
      );
      if (aktif.length > 0) {
        await conn.end();
        return new Response(
          JSON.stringify({
            error: "Masih ada kode presensi aktif. Selesaikan dulu sebelum membuat baru.",
          }),
          { status: 409 }
        );
      }

      // 🧩 2️⃣ Cek apakah pertemuan sebelumnya sudah ada
      if (parseInt(pertemuan_ke) > 1) {
        const [cekSebelumnya] = await conn.execute(
          `SELECT id FROM tb_kode_presensi
           WHERE praktikum_id=? AND pertemuan_ke=?`,
          [praktikum_id, parseInt(pertemuan_ke) - 1]
        );

        if (cekSebelumnya.length === 0) {
          await conn.end();
          return new Response(
            JSON.stringify({
              error: `Tidak dapat membuat kode presensi untuk pertemuan ${pertemuan_ke}. Pertemuan ke ${pertemuan_ke - 1} belum ada presensi.`,
            }),
            { status: 409 }
          );
        }
      }

      // 🧩 3️⃣ Cek duplikasi pertemuan ke-n
      const [cek] = await conn.execute(
        "SELECT id FROM tb_kode_presensi WHERE praktikum_id=? AND pertemuan_ke=?",
        [praktikum_id, pertemuan_ke]
      );

      if (cek.length > 0) {
        await conn.end();
        return new Response(
          JSON.stringify({
            error: "Kode presensi untuk pertemuan ini sudah ada",
          }),
          { status: 409 }
        );
      }

      // 💾 4️⃣ Simpan data ke database
      const [result] = await conn.execute(
        `INSERT INTO tb_kode_presensi 
         (praktikum_id, pertemuan_ke, materi, lokasi, kode, generated_by_assisten_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'aktif', NOW())`,
        [praktikum_id, pertemuan_ke, materi, lokasi, kode, user.id]
      );

      await conn.end();

      // 🪵 5️⃣ Catat log audit
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "create_kode_presensi",
        ip,
        meta: { praktikum_id, pertemuan_ke, kode },
      });

      return new Response(
        JSON.stringify({
          message: "Kode presensi berhasil dibuat",
          id: result.insertId,
        }),
        { status: 200 }
      );
    },
  });
}
