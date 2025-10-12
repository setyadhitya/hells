// app/api/admin/approve/route.js
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { secureHandler } from "../../../../lib/secureApi";

// 🔹 Koneksi database
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 GET — Ambil semua akun pendaftaran ====================
export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async ({ user, ip, logAudit }) => {
      // ✅ Hanya admin yang boleh melihat
      if (user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM tb_pendaftaran_akun ORDER BY id DESC");
      await conn.end();

      // Catat audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "read_pendaftaran_akun",
        ip,
      });

      return rows;
    },
  });
}

// ==================== 🔹 POST — Approve akun praktikan ====================
export async function POST(req) {
  return secureHandler(req, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: true,
    handler: async ({ req, user, ip, logAudit }) => {
      // ✅ Hanya admin yang boleh approve
      if (user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      const body = await req.json();
      const { id, username, nama, nim, nomorhp, password } = body;

      if (!id || !username || !nama || !nim || !nomorhp || !password) {
        return new Response(JSON.stringify({ error: "Data tidak lengkap" }), { status: 400 });
      }

      const conn = await getConnection();

      // 🔍 Cek apakah akun sudah di-approve sebelumnya
      const [cek] = await conn.execute(
        "SELECT * FROM tb_pendaftaran_akun WHERE id=? AND status='approve'",
        [id]
      );
      if (cek.length > 0) {
        await conn.end();
        return new Response(
          JSON.stringify({ error: "Akun ini sudah di-approve sebelumnya" }),
          { status: 400 }
        );
      }

      // 🔐 Hash password sebelum dimasukkan ke tabel praktikan
      const hashed = await bcrypt.hash(password, 10);

      // 🔄 Update status pendaftaran
      await conn.execute("UPDATE tb_pendaftaran_akun SET status='approve' WHERE id=?", [id]);

      // 🧩 Masukkan data ke tabel tb_praktikan
      await conn.execute(
        "INSERT INTO tb_praktikan (username, nama, nim, nomorhp, password, role, status, created_at) VALUES (?,?,?,?,?,?,?,NOW())",
        [username, nama, nim, nomorhp, hashed, "praktikan", "aktif"]
      );

      await conn.end();

      // 🪵 Catat aktivitas ke audit log
      await logAudit({
        userId: user.id,
        username: user.username,
        action: "approve_praktikan",
        ip,
        meta: { username, nama },
      });

      return { message: "Akun berhasil di-approve dan dimasukkan ke daftar praktikan" };
    },
  });
}
