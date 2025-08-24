import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// GET by ID
export async function GET(req, { params }) {
  const db = await getConnection();
  const [rows] = await db.query("SELECT * FROM tb_halaman WHERE id=?", [params.id]);
  await db.end();
  return Response.json(rows[0] || {});
}

// UPDATE
export async function PUT(req, { params }) {
  const { modul_id, nomor_halaman, isi } = await req.json();
  const db = await getConnection();
  await db.query(
    "UPDATE tb_halaman SET modul_id=?, nomor_halaman=?, isi=? WHERE id=?",
    [modul_id, nomor_halaman, isi, params.id]
  );
  await db.end();
  return Response.json({ message: "Halaman updated" });
}

// DELETE
export async function DELETE(req, { params }) {
  const db = await getConnection();
  await db.query("DELETE FROM tb_halaman WHERE id=?", [params.id]);
  await db.end();
  return Response.json({ message: "Halaman deleted" });
}
