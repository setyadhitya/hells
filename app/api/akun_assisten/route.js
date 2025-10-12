// app/api/akun_assisten/route.js
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { secureHandler } from "../../../lib/secureApi.js"; // gunakan handler aman

// 🔹 Fungsi koneksi database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 GET — Ambil profil asisten ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    handler: async ({ req, user }) => {
      try {
        // 🔒 Hanya asisten yang boleh mengambil profil
        if (user.role?.toLowerCase() !== "assisten") {
          return new Response(
            JSON.stringify({ error: "Akses ditolak, bukan asisten" }),
            { status: 403 }
          );
        }

        // Ambil parameter id dari query
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id") || user.id; // fallback ke id user login

        if (!id)
          return new Response(JSON.stringify({ error: "ID tidak ditemukan" }), {
            status: 400,
          });

        const conn = await getConnection();
        const [rows] = await conn.execute(
          "SELECT id, username, nama, nomorhp FROM tb_assisten WHERE id=?",
          [id]
        );
        await conn.end();

        if (rows.length === 0) {
          return new Response(
            JSON.stringify({ error: "Data tidak ditemukan" }),
            { status: 404 }
          );
        }

        // ✅ kirim profil tunggal
        return new Response(JSON.stringify(rows[0]), { status: 200 });
      } catch (err) {
        console.error("GET profil error:", err);
        return new Response(
          JSON.stringify({ error: "Gagal mengambil data" }),
          { status: 500 }
        );
      }
    },
  });
}

// ==================== 🔹 PUT — Update profil asisten ====================
export async function PUT(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    handler: async ({ req, user }) => {
      try {
        const data = await req.json();
        const { id, username, nama, nomorhp, password, oldPassword } = data;

        // 🔒 Pastikan user hanya boleh ubah profil miliknya
        if (parseInt(id) !== user.id) {
          return new Response(
            JSON.stringify({ error: "Tidak boleh mengubah akun orang lain" }),
            { status: 403 }
          );
        }

        const conn = await getConnection();

        // Ambil data lama dari DB
        const [rows] = await conn.execute(
          "SELECT * FROM tb_assisten WHERE id=?",
          [id]
        );
        if (rows.length === 0) {
          await conn.end();
          return new Response(
            JSON.stringify({ error: "Data tidak ditemukan" }),
            { status: 404 }
          );
        }
        const oldData = rows[0];
        // Validasi nama & nomor HP di backend juga
        if (nama && !/^[A-Za-z\s.'-]+$/.test(nama)) {
          return new Response(JSON.stringify({ error: "Nama hanya boleh huruf dan spasi" }), { status: 400 });
        }
        if (nomorhp && !/^[0-9+]+$/.test(nomorhp)) {
          return new Response(JSON.stringify({ error: "Nomor HP hanya boleh berisi angka" }), { status: 400 });
        }

        // --- Validasi nilai yang tidak berubah ---
        if (username && username === oldData.username)
          return new Response(
            JSON.stringify({ error: "Username baru sama dengan username lama" }),
            { status: 400 }
          );
        if (nama && nama === oldData.nama)
          return new Response(
            JSON.stringify({ error: "Nama baru sama dengan nama lama" }),
            { status: 400 }
          );
        if (nomorhp && nomorhp === oldData.nomorhp)
          return new Response(
            JSON.stringify({ error: "Nomor HP baru sama dengan nomor HP lama" }),
            { status: 400 }
          );

        // --- Validasi dan hashing password baru (jika diubah) ---
        let hashedPassword = null;
        if (password && password.trim() !== "") {
          if (!oldPassword)
            return new Response(
              JSON.stringify({
                error: "Masukkan password lama untuk mengganti password",
              }),
              { status: 400 }
            );

          const match = await bcrypt.compare(oldPassword, oldData.password);
          if (!match)
            return new Response(
              JSON.stringify({ error: "Password lama salah" }),
              { status: 400 }
            );

          hashedPassword = await bcrypt.hash(password, 10);
        }

        // --- Gunakan nilai lama jika field tidak dikirim ---
        const newUsername = username ?? oldData.username;
        const newNama = nama ?? oldData.nama;
        const newNomorhp = nomorhp ?? oldData.nomorhp;

        // --- Update data ---
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
        return new Response(
          JSON.stringify({ success: true, message: "Profil berhasil diperbarui" }),
          { status: 200 }
        );
      } catch (err) {
        console.error("PUT profil error:", err);
        return new Response(
          JSON.stringify({ error: "Gagal update data" }),
          { status: 500 }
        );
      }
    },
  });
}
