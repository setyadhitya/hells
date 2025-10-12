import mysql from "mysql2/promise";

// ======================================================
// 🔹 GET — Ambil detail modul berdasarkan ID
// ======================================================
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 🔸 Ambil detail utama dari tb_modul
    const [modulRows] = await connection.execute(
      `SELECT id, mata_kuliah, pertemuan, materi
       FROM tb_modul
       WHERE id = ?`,
      [id]
    );

    if (modulRows.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "Modul tidak ditemukan" }), {
        status: 404,
      });
    }

    const modul = modulRows[0];

    // 🔸 Ambil semua isi halaman dari tb_isimodul (berdasarkan modul_id)
    const [halamanRows] = await connection.execute(
      `SELECT halaman AS nomor, gambar, deskripsi
       FROM tb_isimodul
       WHERE modul_id = ?
       ORDER BY halaman ASC`,
      [id]
    );

   // Ambil mata kuliah dari modul saat ini
const mataKuliah = modulRows[0].mata_kuliah;

// 🔹 Cari prev/next id tapi masih dalam mata kuliah yang sama
const [prevNext] = await connection.execute(
  `SELECT
     (SELECT id FROM tb_modul 
      WHERE id < ? AND mata_kuliah = ? 
      ORDER BY id DESC LIMIT 1) AS prev_id,
     (SELECT id FROM tb_modul 
      WHERE id > ? AND mata_kuliah = ? 
      ORDER BY id ASC LIMIT 1) AS next_id`,
  [id, mataKuliah, id, mataKuliah]
);


    await connection.end();

    const response = {
      id: modul.id,
      mata_kuliah: modul.mata_kuliah,
      pertemuan: modul.pertemuan,
      materi: modul.materi,
      halaman: halamanRows,
      prev_id: prevNext[0].prev_id,
      next_id: prevNext[0].next_id,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("🔥 Gagal ambil data modul by ID:", error);
    return new Response(
      JSON.stringify({ error: "Gagal ambil data modul" }),
      { status: 500 }
    );
  }
}
