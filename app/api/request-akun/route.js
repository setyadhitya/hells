import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const body = await req.json();
    const { NIM, Nama, Jurusan, Email } = body;

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // cek NIM aktif
    const [nimRows] = await connection.execute(
      "SELECT * FROM tb_nim WHERE NIM = ? AND status = 'aktif'",
      [NIM]
    );

    if (nimRows.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "NIM tidak valid atau tidak aktif" }), { status: 400 });
    }

    // cek apakah NIM sudah request akun
    const [requestRows] = await connection.execute(
      "SELECT * FROM tb_user_requests WHERE NIM = ?",
      [NIM]
    );

    if (requestRows.length > 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "NIM ini sudah pernah mengirim request akun" }), { status: 400 });
    }

    // simpan request
    await connection.execute(
      `INSERT INTO tb_user_requests (NIM, Nama, Jurusan, Email) 
       VALUES (?, ?, ?, ?)`,
      [NIM, Nama, Jurusan, Email]
    );

    await connection.end();
    return new Response(JSON.stringify({ message: "Request akun berhasil dikirim" }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gagal mengirim request" }), { status: 500 });
  }
}
