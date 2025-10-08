import mysql from "mysql2/promise";

// GET semua modul
export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    const [rows] = await connection.execute(`
      SELECT id, mata_kuliah, pertemuan, gambar, deskripsi, halaman
      FROM tb_isimodul
      ORDER BY id
    `);

    await connection.end();

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Gagal ambil data modul:", error);
    return new Response(
      JSON.stringify({ error: "Gagal ambil data modul" }),
      { status: 500 }
    );
  }
}

// POST tambah modul baru
export async function POST(req) {
  try {
    const body = await req.json();

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    const [result] = await connection.execute(
      `INSERT INTO tb_isimodul (mata_kuliah, pertemuan, gambar, deskripsi, halaman) VALUES (?, ?, ?, ?, ?)`,
      [body.mata_kuliah, body.pertemuan, body.gambar, body.deskripsi, body.halaman]
    );

    await connection.end();

    return new Response(JSON.stringify({ success: true, id: result.insertId }), {
      status: 201,
    });
  } catch (error) {
    console.error("Gagal tambah modul:", error);
    return new Response(
      JSON.stringify({ error: "Gagal tambah modul" }),
      { status: 500 }
    );
  }
}
