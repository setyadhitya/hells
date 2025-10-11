// app/api/admin/praktikan/route.js
import { secureHandler } from "../../../../lib/secureApi";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// Koneksi DB
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ======================
// 🔹 GET — Ambil semua asisten
// ======================
export async function GET(req) {
    console.log("📥 GET /api/admin/praktikan called");

  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async () => {
      const conn = await getConnection();
      const [rows] = await conn.execute(
        "SELECT id, username, nama, nim, nomorhp, role, status, created_at FROM tb_praktikan ORDER BY id DESC"
      );
      await conn.end();
      return rows;
    },
  });
}

// ======================
// 🔹 POST — Tambah praktikan baru
// ======================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ user }) => {
      if (user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }

      const body = await req.json();
      const { username, nama, nim, nomorhp, password, role, status } = body;

      if (!username || !nama || !nim || !password) {
        return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
          status: 400,
        });
      }

      const hash = await bcrypt.hash(password, 10);
      const conn = await getConnection();
      const [result] = await conn.execute(
        "INSERT INTO tb_praktikan (username, nama, nim, nomorhp, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [username, nama, nim, nomorhp, hash, role || "praktikan", status || "aktif"]
      );
      await conn.end();

      return { message: "Asisten berhasil ditambahkan", id: result.insertId };
    },
  });
}


// ======================
// 🔹 PUT — Update praktikan
// ======================
export async function PUT(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    handler: async ({ user }) => {
      if (user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const body = await req.json();
      let { id, username, nama, nim, nomorhp, password, role, status } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: "ID wajib dikirim" }), { status: 400 });
      }

      // 🧩 Pastikan default benar-benar aman
      if (!role || role.trim() === "") role = "praktikan";
      if (!status || status.trim() === "") status = "aktif";

      const conn = await getConnection();

      if (password && password.trim() !== "") {
        const hash = await bcrypt.hash(password, 10);
        await conn.execute(
          `UPDATE tb_praktikan
           SET username=?, nama=?, nim=?, nomorhp=?, password=?, role=?, status=?
           WHERE id=?`,
          [username, nama, nim, nomorhp, hash, role, status, id]
        );
      } else {
        await conn.execute(
          `UPDATE tb_praktikan
           SET username=?, nama=?, nim=?, nomorhp=?, role=?, status=? 
           WHERE id=?`,
          [username, nama, nim, nomorhp, role, status, id]
        );
      }

      await conn.end();
      return { message: "Data asisten berhasil diperbarui" };
    },
  });
}




// ======================
// 🔹 DELETE — Hapus asisten
// ======================
export async function DELETE(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    handler: async ({ user }) => {
      if (user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "ID tidak dikirim" }), {
          status: 400,
        });
      }

      const conn = await getConnection();
      await conn.execute("DELETE FROM tb_praktikan WHERE id=?", [id]);
      await conn.end();

      return { message: "Praktikan berhasil dihapus" };
    },
  });
}
