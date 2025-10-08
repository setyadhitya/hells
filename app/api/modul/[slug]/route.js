import mysql from "mysql2/promise";

export async function GET(req) {
  try {
    // Ambil slug dari URL
    const url = new URL(req.url);
const slug = decodeURIComponent(url.pathname.split("/").pop()); // decode dulu


console.log("Slug diterima API:", slug);

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    const [halamanRows] = await connection.execute(
      `SELECT id, mata_kuliah, pertemuan, halaman, gambar, deskripsi 
       FROM tb_isimodul 
       WHERE pertemuan = ? 
       ORDER BY CAST(halaman AS UNSIGNED) ASC`,
      [slug]
    );

    if (halamanRows.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: "Modul tidak ditemukan" }), {
        status: 404,
      });
    }

    const mata_kuliah = halamanRows[0].mata_kuliah;

    const [materiRows] = await connection.execute(
      `SELECT materi 
       FROM tb_modul 
       WHERE mata_kuliah = ? AND pertemuan = ?`,
      [mata_kuliah, slug]
    );

    await connection.end();

    const halaman = halamanRows.map((r) => ({
      nomor: r.halaman,
      gambar: r.gambar,
      deskripsi: r.deskripsi,
    }));

    const modul = {
      mata_kuliah,
      pertemuan: slug,
      halaman,
      materi: materiRows[0]?.materi || "",
    };

    return new Response(JSON.stringify(modul), { status: 200 });
  } catch (error) {
    console.error("Gagal ambil detail modul:", error);
    return new Response(JSON.stringify({ error: "Gagal ambil detail modul" }), {
      status: 500,
    });
  }
}
