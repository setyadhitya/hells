import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// GET ALL
export async function GET() {
  const db = await getConnection();
  const [rows] = await db.query("SELECT * FROM tb_halaman ORDER BY id DESC");
  await db.end();
  return Response.json(rows);
}

// CREATE
export async function POST(req) {
  const { modul_id, nomor_halaman, isi } = await req.json();
  const db = await getConnection();
  await db.query(
    "INSERT INTO tb_halaman (modul_id, nomor_halaman, isi) VALUES (?, ?, ?)",
    [modul_id, nomor_halaman, isi]
  );
  await db.end();
  return Response.json({ message: "Halaman created" });
}
