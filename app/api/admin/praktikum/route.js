import mysql from "mysql2/promise";
import { verifyToken } from "../../../lib/auth";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔹 Middleware helper untuk cek token
async function auth(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// 🔹 GET semua praktikum (hanya user login)
export async function GET(req) {
  try {
    await auth(req); // cek token
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_praktikum");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), { status: 401 });
  }
}

// 🔹 POST tambah praktikum (hanya admin/laboran)
export async function POST(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const { Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan, Tanggal_Mulai } = body;

    const conn = await getConnection();

    // cek duplikasi praktikum
    const [duplikasi] = await conn.execute(
      `SELECT ID FROM tb_praktikum WHERE Mata_Kuliah=? AND Kelas=?`,
      [Mata_Kuliah, Kelas]
    );
    if (duplikasi.length > 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: `Praktikum ${Mata_Kuliah} untuk kelas ${Kelas} sudah ada` }), { status: 400 });
    }

    // cek bentrok shift
    const [bentrok] = await conn.execute(
      `SELECT ID FROM tb_praktikum WHERE Hari=? AND Shift=?`,
      [Hari, Shift]
    );
    if (bentrok.length > 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: `Sudah ada praktikum di hari ${Hari}, shift ${Shift}` }), { status: 400 });
    }

    const [result] = await conn.execute(
      `INSERT INTO tb_praktikum (Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan]
    );
    const newId = result.insertId;

    // generate 10 jadwal
    let tanggalAwal = new Date(Tanggal_Mulai);
    for (let i = 1; i <= 10; i++) {
      let tanggal = new Date(tanggalAwal);
      tanggal.setDate(tanggalAwal.getDate() + (i - 1) * 7);
      await conn.execute(
        `INSERT INTO tb_jadwal (ID_Praktikum, Tanggal, Pertemuan_ke, Catatan)
         VALUES (?,?,?,NULL)`,
        [newId, tanggal.toISOString().split("T")[0], i]
      );
    }

    await conn.end();
    return Response.json({ message: "Praktikum & jadwal berhasil ditambahkan", id: newId });
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), { status: 401 });
  }
}

// 🔹 PUT update praktikum
export async function PUT(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const { ID, Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan } = body;

    const conn = await getConnection();

    // cek duplikasi update
    const [duplikasi] = await conn.execute(
      `SELECT ID FROM tb_praktikum WHERE Mata_Kuliah=? AND Kelas=? AND ID!=?`,
      [Mata_Kuliah, Kelas, ID]
    );
    if (duplikasi.length > 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: `Praktikum ${Mata_Kuliah} untuk kelas ${Kelas} sudah ada` }), { status: 400 });
    }

    // cek bentrok shift
    const [bentrok] = await conn.execute(
      `SELECT ID FROM tb_praktikum WHERE Hari=? AND Shift=? AND ID!=?`,
      [Hari, Shift, ID]
    );
    if (bentrok.length > 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: `Sudah ada praktikum di hari ${Hari}, shift ${Shift}` }), { status: 400 });
    }

    await conn.execute(
      `UPDATE tb_praktikum
       SET Mata_Kuliah=?, Jurusan=?, Kelas=?, Semester=?, Hari=?, Jam_Mulai=?, Jam_Ahir=?, Shift=?, Assisten=?, Catatan=?
       WHERE ID=?`,
      [Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan, ID]
    );

    await conn.end();
    return Response.json({ message: "Praktikum berhasil diperbarui" });
  } catch (err) {
    console.error("PUT Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), { status: 401 });
  }
}

// 🔹 DELETE hapus praktikum
export async function DELETE(req) {
  try {
    const user = await auth(req);
    if (!["admin", "laboran"].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();
    await conn.execute("DELETE FROM tb_praktikum WHERE ID=?", [id]);
    await conn.end();

    return Response.json({ message: "Praktikum berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unauthorized" }), { status: 401 });
  }
}
