// app/api/akun/route.js
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔹 Ambil profil praktikan


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID tidak ditemukan" }, { status: 400 });
  }

  const conn = await getConnection();
  const [rows] = await conn.execute("SELECT id, username, nama, nomorhp FROM tb_assisten WHERE id=?", [id]);
  await conn.end();

  if (rows.length === 0) {
    return Response.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }

  return Response.json(rows[0]); // ✅ kirim profil tunggal
}


// 🔹 Update profil praktikan
export async function PUT(req) {
  const data = await req.json();
  const { id, username, nama, nomorhp, password, oldPassword } = data;

  const conn = await getConnection();

  try {
    // Ambil data lama
    const [rows] = await conn.execute("SELECT * FROM tb_assisten WHERE id=?", [id]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
    }
    const oldData = rows[0];

    // --- Validasi nilai sama ---
    if (username && username === oldData.username) {
      return new Response(JSON.stringify({ error: "Username baru sama dengan username lama" }), { status: 400 });
    }
    if (nama && nama === oldData.nama) {
      return new Response(JSON.stringify({ error: "Nama baru sama dengan nama lama" }), { status: 400 });
    }
    if (nomorhp && nomorhp === oldData.nomorhp) {
      return new Response(JSON.stringify({ error: "Nomor HP baru sama dengan nomor HP lama" }), { status: 400 });
    }

    // --- Validasi password lama kalau ingin ganti password ---
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      if (!oldPassword) {
        return new Response(JSON.stringify({ error: "Harap masukkan password lama untuk mengganti password" }), { status: 400 });
      }
      const match = await bcrypt.compare(oldPassword, oldData.password);
      if (!match) {
        return new Response(JSON.stringify({ error: "Password lama salah" }), { status: 400 });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Gunakan nilai lama jika field tidak dikirim
    const newUsername = username ?? oldData.username;
    const newNama = nama ?? oldData.nama;
    const newNomorhp = nomorhp ?? oldData.nomorhp;

    // Update ke DB
    if (hashedPassword) {
      await conn.execute(
        "UPDATE tb_assisten SET username=?, nama=?, nomorhp=?, password=? WHERE id=?",
        [newUsername, newNama, newNomorhp, hashedPassword, id]
      );
    } else {
      await conn.execute(
        "UPDATE tb_assisten SET username=?, nama=?, nomorhp=? WHERE id=?",
        [newUsername, newNama, newNomorhp, id]
      );
    }

    await conn.end();
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Update error:", error);
    return new Response(JSON.stringify({ error: "Gagal update data" }), { status: 500 });
  }
}
