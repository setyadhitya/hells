import mysql from "mysql2/promise";

// ==========================================================
// 🔹 GET — Ambil semua modul utama (tanpa isi halaman)
// ==========================================================
export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // Ambil semua data dari tb_modul, urut berdasarkan mata kuliah & pertemuan
    const [rows] = await connection.execute(`
      SELECT id, mata_kuliah, pertemuan, materi
      FROM tb_modul
      ORDER BY mata_kuliah ASC, id ASC
    `);

    await connection.end();

    // Kembalikan sebagai array JSON (supaya .reduce() aman di frontend)
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("🔥 Gagal ambil data modul:", error);
    return new Response(
      JSON.stringify({ error: "Gagal ambil data modul" }),
      { status: 500 }
    );
  }
}

// ==========================================================
// 🔹 POST — Tambah modul baru (data induk)
// ==========================================================
export async function POST(req) {
  try {
    const body = await req.json();
    const { mata_kuliah, pertemuan, materi } = body;

    if (!mata_kuliah || !pertemuan) {
      return new Response(
        JSON.stringify({ error: "Mata kuliah dan pertemuan wajib diisi" }),
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // Masukkan ke tabel tb_modul
    const [result] = await connection.execute(
      `INSERT INTO tb_modul (mata_kuliah, pertemuan, materi)
       VALUES (?, ?, ?)`,
      [mata_kuliah, pertemuan, materi || null]
    );

    await connection.end();

    return new Response(
      JSON.stringify({ success: true, id: result.insertId }),
      { status: 201 }
    );
  } catch (error) {
    console.error("🔥 Gagal tambah modul:", error);
    return new Response(
      JSON.stringify({ error: "Gagal tambah modul" }),
      { status: 500 }
    );
  }
}
