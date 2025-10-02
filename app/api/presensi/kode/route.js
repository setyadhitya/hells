import mysql from "mysql2/promise";

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    const [rows] = await connection.execute(
      "SELECT id, kode, pertemuan_ke FROM tb_kode_presensi ORDER BY created_at DESC"
    );

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("Error ambil kode presensi:", err);
    return new Response(JSON.stringify({ error: "Gagal ambil kode presensi" }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
