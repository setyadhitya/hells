// app/api/akun/kumpul_tugas/route.js
import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import path from "path";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

const allowedExtensions = ["jpg","jpeg","png","doc","docx","xls","xlsx","ppt","pptx","pdf","rar"];
const maxFileSize = 256 * 1024; // 256 KB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const praktikan_id = formData.get("praktikan_id");
    const praktikum_id = formData.get("praktikum_id");
    const pertemuan = formData.get("pertemuan");
    const file = formData.get("file"); // bisa null

    if (!praktikan_id || !praktikum_id || !pertemuan) {
      return new Response(JSON.stringify({ error: "Data tidak lengkap" }), { status: 400 });
    }

    const conn = await getConnection();

    // Cek peserta
    const [peserta] = await conn.execute(
      "SELECT * FROM tb_peserta WHERE praktikan_id=? AND praktikum_id=?",
      [praktikan_id, praktikum_id]
    );

    if (peserta.length === 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Anda bukan peserta praktikum ini" }), { status: 400 });
    }

    // Cek duplikat tugas (praktikum + pertemuan)
    const [existing] = await conn.execute(
      "SELECT * FROM tb_kumpul_tugas WHERE praktikan_id=? AND praktikum_id=? AND pertemuan=?",
      [praktikan_id, praktikum_id, pertemuan]
    );

    if (existing.length > 0) {
      await conn.end();
      return new Response(JSON.stringify({ error: "Tugas untuk praktikum dan pertemuan ini sudah dikumpulkan. Jika ingin mengumpulkan ulang/revisi silahkan hubungi asisten masing-masing" }), { status: 400 });
    }

    // Proses file
    let fileName = null;
    if (file && file.size > 0) {
      if (file.size > maxFileSize) {
        await conn.end();
        return new Response(JSON.stringify({ error: "Ukuran file maksimal 256 KB" }), { status: 400 });
      }

      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        await conn.end();
        return new Response(JSON.stringify({ error: "Ekstensi file tidak diperbolehkan" }), { status: 400 });
      }

      const uploadsDir = path.join(process.cwd(), "public/uploads/file_kumpul");
      await fs.mkdir(uploadsDir, { recursive: true });

      fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadsDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    }

    // Insert tugas
    await conn.execute(
      "INSERT INTO tb_kumpul_tugas (praktikan_id, praktikum_id, pertemuan, file, created_at) VALUES (?, ?, ?, ?, NOW())",
      [praktikan_id, praktikum_id, pertemuan, fileName]
    );

    await conn.end();
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Kumpul tugas error:", error);
    return new Response(JSON.stringify({ error: "Gagal mengumpulkan tugas" }), { status: 500 });
  }
}
