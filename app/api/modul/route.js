import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'stern'
    });

    const [rows] = await connection.execute(`
      SELECT id, mata_kuliah, pertemuan, gambar, deskripsi, halaman
      FROM tb_isimodul
      ORDER BY id
    `);

    await connection.end();

    return Response.json(rows);

  } catch (error) {
    console.error('Gagal ambil data modul:', error);
    return new Response(JSON.stringify({ error: 'Gagal ambil data modul' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'stern'
    });

    const [result] = await connection.execute(
      `INSERT INTO tb_isimodul (mata_kuliah, pertemuan, gambar, deskripsi, halaman) VALUES (?, ?, ?, ?, ?)`,
      [body.mata_kuliah, body.pertemuan, body.gambar, body.deskripsi, body.halaman]
    );

    await connection.end();

    return Response.json({ success: true, id: result.insertId });

  } catch (error) {
    console.error('Gagal tambah modul:', error);
    return new Response(JSON.stringify({ error: 'Gagal tambah modul' }), { status: 500 });
  }
}
