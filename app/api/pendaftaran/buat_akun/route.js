import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { nim, email, password } = await req.json();

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // cek nim ada di tb_nim
    const [nimRows] = await connection.execute(
      "SELECT * FROM tb_nim WHERE nim = ?",
      [nim]
    );

    if (nimRows.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "NIM tidak ditemukan" }), {
        status: 400,
      });
    }

    const id_nim = nimRows[0].id;

    // cek apakah nim sudah terdaftar di tb_users_praktikan
    const [cekNim] = await connection.execute(
      "SELECT * FROM tb_users_praktikan WHERE id_nim = ?",
      [id_nim]
    );
    if (cekNim.length > 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "NIM sudah terdaftar" }), {
        status: 400,
      });
    }

    // cek email sudah terdaftar
    const [cekEmail] = await connection.execute(
      "SELECT * FROM tb_users_praktikan WHERE email = ?",
      [email]
    );
    if (cekEmail.length > 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "Email sudah terdaftar" }), {
        status: 400,
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user baru
    await connection.execute(
      "INSERT INTO tb_users_praktikan (id_nim, email, password) VALUES (?, ?, ?)",
      [id_nim, email, hashedPassword]
    );

    await connection.end();
    return new Response(JSON.stringify({ message: "Akun berhasil dibuat" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gagal membuat akun" }), {
      status: 500,
    });
  }
}
