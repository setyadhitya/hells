import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const id_nim = formData.get("id_nim");
    const mataKuliahIDs = formData.getAll("Mata_Kuliah[]");

    // folder upload
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

    for (let matkulID of mataKuliahIDs) {
      await connection.execute(
        `INSERT INTO tb_pendaftaran (id_nim, mata_kuliah, ktm, foto, krs, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_nim, matkulID, ktmPath, fotoPath, krsPath]
      );
    }

    await connection.end();

    return new Response(JSON.stringify({ message: "Pendaftaran berhasil!" }), {
      status: 200,
    });
  } catch (err) {
    console.error("FORM ERROR:", err);
    return new Response(JSON.stringify({ error: "Gagal mendaftar" }), {
      status: 500,
    });
  }
}
