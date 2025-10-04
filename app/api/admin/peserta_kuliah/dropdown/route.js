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
  const db = await getConnection();
  const [praktikan] = await db.execute("SELECT id, nama FROM tb_praktikan ORDER BY nama ASC");
  const [matkul] = await db.execute("SELECT id, mata_kuliah FROM tb_matakuliah ORDER BY mata_kuliah ASC");
  await db.end();

  return Response.json({ praktikan, matkul });
}
