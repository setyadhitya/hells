import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern"
    });

    const [rows] = await connection.execute(
      "SELECT ID, Mata_Kuliah FROM tb_praktikum ORDER BY Mata_Kuliah"
    );

    await connection.end();
    return new Response(JSON.stringify(rows));
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gagal ambil data praktikum" }), { status: 500 });
  }
}
