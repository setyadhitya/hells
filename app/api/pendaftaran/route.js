import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { username, nama, nim, nomorhp, password } = await req.json();

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 🔹 Cek apakah username sudah dipakai
    const [cekUser] = await connection.execute(
      "SELECT * FROM tb_pendaftaran_akun WHERE username = ?",
      [username]
    );
    if (cekUser.length > 0) {
      await connection.end();
      return new Response(
        JSON.stringify({ error: "Username sudah terdaftar" }),
        { status: 400 }
      );
    }

    // 🔹 Cek apakah nama sudah dipakai
    const [cekNama] = await connection.execute(
      "SELECT * FROM tb_pendaftaran_akun WHERE nama = ?",
      [nama]
    );
    if (cekNama.length > 0) {
      await connection.end();
      return new Response(
        JSON.stringify({ error: "Nama sudah terdaftar" }),
        { status: 400 }
      );
    }

    // 🔹 Cek apakah NIM sudah dipakai
    const [cekNim] = await connection.execute(
      "SELECT * FROM tb_pendaftaran_akun WHERE nim = ?",
      [nim]
    );
    if (cekNim.length > 0) {
      await connection.end();
      return new Response(
        JSON.stringify({ error: "NIM sudah terdaftar" }),
        { status: 400 }
      );
    }

    // 🔹 Hash password sebelum simpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Insert akun baru dengan status waiting
    await connection.execute(
      "INSERT INTO tb_pendaftaran_akun (username, nama, nim, nomorhp, password, status) VALUES (?, ?, ?, ?, ?, 'waiting')",
      [username, nama, nim, nomorhp, hashedPassword]
    );

    await connection.end();
    return new Response(
      JSON.stringify({
        message:
          "Request akun terkirim, silahkan menunggu 1x24 jam untuk approve akun.",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Gagal mengajukan request akun" }),
      { status: 500 }
    );
  }
}
