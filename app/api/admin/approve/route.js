import mysql from "mysql2/promise";
import { verifyToken } from "../../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user || user.role !== "admin") throw new Error("Forbidden");
  return user;
}

// 🔹 GET semua akun pendaftaran
export async function GET(req) {
  try {
    await auth(req);
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_pendaftaran_akun");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 401 });
  }
}

// 🔹 POST approve akun
export async function POST(req) {
  try {
    await auth(req);
    const body = await req.json();
    const { id, username, nama, nim, nomorhp, password } = body;

    const conn = await getConnection();

    // cek sudah approve?
    const [cek] = await conn.execute(
      "SELECT * FROM tb_pendaftaran_akun WHERE id=? AND status='approve'",
      [id]
    );
    if (cek.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: "Akun sudah di-approve" }),
        { status: 400 }
      );
    }

    // update status
    await conn.execute(
      "UPDATE tb_pendaftaran_akun SET status='approve' WHERE id=?",
      [id]
    );

    // masukkan ke tb_praktikan (role = praktikan)
    await conn.execute(
      "INSERT INTO tb_praktikan (username, nama, nim, nomorhp, password, role, status) VALUES (?,?,?,?,?,?,?)",
      [username, nama, nim, nomorhp, password, "praktikan", "aktif"]
    );

    await conn.end();
    return Response.json({ message: "Akun berhasil di-approve" });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 401 });
  }
}
