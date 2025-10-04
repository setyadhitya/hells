import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const { mata_kuliah_id, pertemuan_ke, materi, kode, generated_by_assisten_id } =
      await req.json();

    if (!mata_kuliah_id || !pertemuan_ke || !materi || !kode || !generated_by_assisten_id) {
      return new Response(
        JSON.stringify({ error: "Semua field wajib diisi" }),
        { status: 400 }
      );
    }

    // 🔹 Koneksi database
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 🔹 Cek duplikat mata_kuliah_id + pertemuan_ke
    const [cek] = await conn.execute(
      `SELECT id FROM tb_kode_presensi WHERE mata_kuliah_id = ? AND pertemuan_ke = ?`,
      [mata_kuliah_id, pertemuan_ke]
    );

    if (cek.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: "Kode presensi untuk mata kuliah & pertemuan ini sudah ada" }),
        { status: 409 }
      );
    }

    // 🔹 Simpan ke database
    const [result] = await conn.execute(
      `INSERT INTO tb_kode_presensi
        (mata_kuliah_id, pertemuan_ke, materi, kode, generated_by_assisten_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'aktif', NOW())`,
      [mata_kuliah_id, pertemuan_ke, materi, kode, generated_by_assisten_id]
    );

    await conn.end();

    return new Response(
      JSON.stringify({
        success: true,
        insertId: result.insertId,
        message: "Kode presensi berhasil dibuat",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("POST kode_presensi error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
