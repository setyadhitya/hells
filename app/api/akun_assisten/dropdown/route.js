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

    // Ambil daftar mata kuliah dari tb_praktikum
    const [matkul] = await conn.execute(
      "SELECT id, mata_kuliah FROM tb_praktikum ORDER BY mata_kuliah ASC"
    );

    await conn.end();

    return new Response(
      JSON.stringify({ matkul }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Dropdown API error:", error);
    return new Response(
      JSON.stringify({ error: "Gagal mengambil data dropdown" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
