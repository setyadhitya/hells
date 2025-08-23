import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const user_id = formData.get("user_id");
    const mataKuliahIDs = formData.getAll("Mata_Kuliah[]");

    const uploadDir = path.join(process.cwd(), "public/uploads/pendaftaran");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const saveFile = async (file) => {
      if (!file) return null;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, file.name);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/pendaftaran/${file.name}`;
    };

    const ktmPath = await saveFile(formData.get("ktm"));
    const fotoPath = await saveFile(formData.get("foto"));
    const krsPath = await saveFile(formData.get("krs"));

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // ✅ cek apakah user sudah mendaftar
    const [cek] = await connection.execute(
      `SELECT COUNT(*) as total FROM tb_pendaftaran WHERE user_id = ?`,
      [user_id]
    );

    if (cek[0].total > 0) {
      await connection.end();
      return new Response(
        JSON.stringify({ error: "Anda sudah mendaftar sebelumnya" }),
        { status: 400 }
      );
    }

    // insert pendaftaran baru
    for (let matkulID of mataKuliahIDs) {
      await connection.execute(
        `INSERT INTO tb_pendaftaran (user_id, Mata_Kuliah_ID, ktm, foto, krs) VALUES (?, ?, ?, ?, ?)`,
        [user_id, matkulID, ktmPath, fotoPath, krsPath]
      );
    }

    await connection.end();

    return new Response(JSON.stringify({ message: "Pendaftaran berhasil!" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gagal mendaftar" }), {
      status: 500,
    });
  }
}
