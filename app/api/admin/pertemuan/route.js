import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔹 POST: ambil daftar pertemuan berdasarkan mata kuliah
export async function POST(req) {
  try {
    const { mata_kuliah } = await req.json();

    if (!mata_kuliah) {
      return new Response(
        JSON.stringify({ error: "mata_kuliah wajib dikirim" }),
        { status: 400 }
      );
    }

    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT id, pertemuan FROM tb_modul WHERE mata_kuliah = ? ORDER BY pertemuan ASC",
      [mata_kuliah]
    );

    await conn.end();

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("❌ Error get pertemuan:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
