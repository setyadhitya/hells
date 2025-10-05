import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(`
      SELECT b.id, b.praktikum_id, p.mata_kuliah
      FROM tb_beritugas b
      JOIN tb_praktikum p ON b.praktikum_id = p.id
      ORDER BY b.created_at DESC
    `);
    await conn.end();
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Gagal mengambil daftar tugas" }),
      { status: 500 }
    );
  }
}
