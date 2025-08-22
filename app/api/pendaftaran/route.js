import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

// Supaya Next.js tidak mem-parsing body otomatis
export const config = {
  api: {
    bodyParser: false
  }
}

export async function POST(req) {
  try {
    const form = new IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public/uploads/pendaftaran');
    form.keepExtensions = true;
    form.multiples = true;

    // buat folder jika belum ada
    if (!fs.existsSync(form.uploadDir)) fs.mkdirSync(form.uploadDir, { recursive: true });

    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    });

    const user_id = 3; // contoh: ganti dengan user ID dari login/session
    const mataKuliahIDs = Array.isArray(data.fields['Mata_Kuliah[]']) ? data.fields['Mata_Kuliah[]'] : [data.fields['Mata_Kuliah[]']]

    const ktmPath = `/uploads/pendaftaran/${path.basename(data.files.ktm.path)}`
    const fotoPath = `/uploads/pendaftaran/${path.basename(data.files.foto.path)}`
    const krsPath = `/uploads/pendaftaran/${path.basename(data.files.krs.path)}`

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern"
    });

    for (let matkulID of mataKuliahIDs) {
      await connection.execute(
        `INSERT INTO tb_pendaftaran (user_id, Mata_Kuliah_ID, ktm, foto, krs) VALUES (?, ?, ?, ?, ?)`,
        [user_id, matkulID, ktmPath, fotoPath, krsPath]
      );
    }

    await connection.end();

    return new Response(JSON.stringify({ message: "Pendaftaran berhasil!" }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gagal mendaftar" }), { status: 500 });
  }
}
