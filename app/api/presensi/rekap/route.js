import mysql from "mysql2/promise";

export async function GET(req) {
  let connection;
  try {
    const { searchParams } = new URL(req.url);
    const kodeId = searchParams.get("kode_id"); // ambil kode_id dari query string

    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    let sql = `
      SELECT
          mk.mata_kuliah,
          kp.kode AS kode_presensi,
          p.nama AS nama,
          p.nim,
          pr.status,
          pr.lokasi,
          pr.created_at AS tanggal,
          a.nama AS assisten
      FROM tb_presensi pr
      JOIN tb_matakuliah mk ON pr.mata_kuliah_id = mk.id
      JOIN tb_kode_presensi kp ON pr.kode_id = kp.id
      JOIN tb_praktikan p ON pr.praktikan_id = p.id
      JOIN tb_assisten a ON pr.assisten_id = a.id
    `;

    const params = [];
    if (kodeId) {
      sql += " WHERE pr.kode_id = ? ";
      params.push(kodeId);
    }
    sql += " ORDER BY pr.created_at DESC";

    const [rows] = await connection.execute(sql, params);

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("Error rekap presensi:", err);
    return new Response(JSON.stringify({ error: "Gagal ambil rekap presensi" }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
