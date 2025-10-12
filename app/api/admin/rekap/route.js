// app/api/admin/rekap/route.js
import { secureHandler } from "../../../../lib/secureApi";
import mysql from "mysql2/promise";

// Koneksi ke DB
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// =========================
// 🔹 GET — Ambil data rekap presensi berdasarkan praktikum
// =========================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async () => {
      const { searchParams } = new URL(req.url);
      const praktikumId = searchParams.get("praktikum_id");

      if (!praktikumId) {
        return new Response(
          JSON.stringify({ error: "praktikum_id wajib dikirim" }),
          { status: 400 }
        );
      }

      const conn = await getConnection();

      // Ambil info dasar praktikum
      const [[praktikum]] = await conn.execute(
        "SELECT jurusan, semester, shift, jam_mulai, jam_ahir FROM tb_praktikum WHERE id=?",
        [praktikumId]
      );

      // Ambil rentang tanggal pelaksanaan (tanggal terkecil & terbesar)
      const [[tanggal]] = await conn.execute(
        `SELECT MIN(DATE(created_at)) AS tgl_awal, MAX(DATE(created_at)) AS tgl_akhir
         FROM tb_presensi WHERE praktikum_id=?`,
        [praktikumId]
      );

      // --- TABEL 1: Daftar praktikan, pertemuan 1–10, total
      const [praktikanRows] = await conn.execute(`
        SELECT 
          pr.praktikan_id,
          u.nama AS nama_praktikan,
          COUNT(DISTINCT pr.pertemuan_ke) AS total_hadir
        FROM tb_presensi pr
        JOIN tb_praktikan u ON pr.praktikan_id = u.id
        WHERE pr.praktikum_id=?
        GROUP BY pr.praktikan_id, u.nama
      `, [praktikumId]);

      // --- TABEL 2: Daftar pertemuan, lokasi, tanggal (ambil satu tiap pertemuan)
      const [pertemuanRows] = await conn.execute(`
        SELECT 
          pertemuan_ke,
          lokasi,
          DATE(MIN(created_at)) AS tanggal
        FROM tb_presensi
        WHERE praktikum_id=?
        GROUP BY pertemuan_ke, lokasi
        ORDER BY pertemuan_ke ASC
      `, [praktikumId]);

      // --- TABEL 3: Daftar asisten
      const [assistenRows] = await conn.execute(`
        SELECT DISTINCT
          a.id AS assisten_id,
          a.nama
        FROM tb_presensi p
        JOIN tb_assisten a ON p.assisten_id = a.id
        WHERE p.praktikum_id=?
      `, [praktikumId]);

      await conn.end();

      return {
        info: {
          jurusan: praktikum?.jurusan || "-",
          semester: praktikum?.semester || "-",
          shift: praktikum?.shift || "-",
          jam: praktikum ? `${praktikum.jam_mulai} - ${praktikum.jam_ahir}` : "-",
          tanggal_awal: tanggal?.tgl_awal || "-",
          tanggal_akhir: tanggal?.tgl_akhir || "-",
        },
        tabel1: praktikanRows,
        tabel2: pertemuanRows,
        tabel3: assistenRows,
      };
    },
  });
}
