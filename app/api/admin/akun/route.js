// app/api/admin/akun/route.js
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
// 🔹 GET — Ambil semua akun
// ======================
export async function GET(req) {
    console.log("📥 GET /api/admin/akun called");

  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async () => {
      const conn = await getConnection();
      const [rows] = await conn.execute(
        "SELECT id, username, role, created_at FROM tb_users ORDER BY id DESC"
      );
      await conn.end();
      return rows;
    },
  });
}

// ======================
// 🔹 POST — Tambah akun baru
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
      const { username, password, role } = body;

      if (!username || !password) {
        return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
          status: 400,
        });
      }

      const hash = await bcrypt.hash(password, 10);
      const conn = await getConnection();
      const [result] = await conn.execute(
        "INSERT INTO tb_users (username, password, role, created_at) VALUES (?, ?, ?, NOW())",
        [username, hash, role || "admin"]
      );
      await conn.end();

      return { message: "Akun berhasil ditambahkan", id: result.insertId };
    },
  });
}


// ======================
// 🔹 PUT — Update akun
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
      let { id, username, password, role } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: "ID wajib dikirim" }), { status: 400 });
      }

      // 🧩 Pastikan default benar-benar aman
      if (!role || role.trim() === "") role = "admin";

      const conn = await getConnection();

      if (password && password.trim() !== "") {
        const hash = await bcrypt.hash(password, 10);
        await conn.execute(
          `UPDATE tb_users
           SET username=?, password=?, role=? 
           WHERE id=?`,
          [username, hash, role, id]
        );
      } else {
        await conn.execute(
          `UPDATE tb_users
           SET username=?, role=? 
           WHERE id=?`,
          [username, role, id]
        );
      }

      await conn.end();
      return { message: "Data akun berhasil diperbarui" };
    },
  });
}




// ======================
// 🔹 DELETE — Hapus akun
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
      await conn.execute("DELETE FROM tb_users WHERE id=?", [id]);
      await conn.end();

      return { message: "Akun berhasil dihapus" };
    },
  });
}
