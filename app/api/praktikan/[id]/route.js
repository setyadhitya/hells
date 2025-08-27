import mysql from "mysql2/promise";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern", // ganti sesuai database kamu
    });

    const [rows] = await connection.execute(
      "SELECT * FROM tb_nim WHERE id = ?",
      [id]
    );

    await connection.end();

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetch praktikan:", error);
    return new Response(
      JSON.stringify({ error: "Gagal mengambil data praktikan" }),
      { status: 500 }
    );
  }
}
