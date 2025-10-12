// app/api/akun_assisten/tugas/beri_tugas/route.js
import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import path from "path";

// ==================== 🔹 FUNGSI KONEKSI DATABASE ====================
async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// ==================== 🔹 BATASAN FILE YANG DIPERBOLEHKAN ====================
const allowedExtensions = [
  "jpg", "jpeg", "png", "doc", "docx",
  "xls", "xlsx", "ppt", "pptx", "pdf", "rar"
];
const maxFileSize = 256 * 1024; // 256 KB

// ==================== 🔹 POST — SIMPAN TUGAS DARI ASSISTEN ====================
export async function POST(req) {
  try {
    // Ambil data form (multipart/form-data)
    const formData = await req.formData();
    const praktikum_id = formData.get("praktikum_id");
    const pertemuan = formData.get("pertemuan");
    const tugas = formData.get("tugas");
    const file = formData.get("file"); // file opsional

    // Validasi input dasar
    if (!praktikum_id || !pertemuan || !tugas) {
      return new Response(JSON.stringify({ error: "Lengkapi semua field!" }), { status: 400 });
    }

    const conn = await getConnection();

    // 🔎 Cek apakah pertemuan untuk mata kuliah ini sudah ada
    const [existing] = await conn.execute(
      "SELECT id FROM tb_beritugas WHERE praktikum_id=? AND pertemuan=?",
      [praktikum_id, pertemuan]
    );
    if (existing.length > 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Tugas untuk pertemuan ini sudah ada!" }), { status: 400 });
    }

    let fileName = null;

    // ==================== 🔹 HANDLE FILE JIKA ADA ====================
    if (file && file.size > 0) {
      // ✅ Cek ukuran file
      if (file.size > maxFileSize) {
        await conn.end();
        return new Response(JSON.stringify({ error: "Ukuran file maksimal 256 KB" }), { status: 400 });
      }

      // ✅ Cek ekstensi file
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        await conn.end();
        return new Response(JSON.stringify({ error: "Ekstensi file tidak diperbolehkan" }), { status: 400 });
      }

      // ✅ Simpan file ke public/uploads/file_tugas
      const uploadsDir = path.join(process.cwd(), "public/uploads/file_tugas");
      await fs.mkdir(uploadsDir, { recursive: true });

      fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadsDir, fileName);

      // Simpan file secara fisik
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    }

    // ==================== 🔹 SIMPAN DATA KE DATABASE ====================
    await conn.execute(
      `INSERT INTO tb_beritugas 
       (praktikum_id, pertemuan, tugas, file, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [praktikum_id, pertemuan, tugas, fileName]
    );

    await conn.end();
    return new Response(JSON.stringify({ success: true, message: "Tugas berhasil disimpan" }), { status: 200 });

  } catch (error) {
    console.error("POST beri_tugas error:", error);
    return new Response(JSON.stringify({ error: "Gagal menyimpan tugas" }), { status: 500 });
  }
}
