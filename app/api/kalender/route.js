// app/api/kalender/route.js
import mysql from 'mysql2/promise';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tanggal = searchParams.get('tanggal');

  if (!tanggal) {
    return new Response(JSON.stringify({ error: 'Tanggal tidak valid' }), { status: 400 });
  }

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'stern'
    });

    const [rows] = await conn.execute(`
      SELECT 
        j.ID, j.Tanggal, j.Pertemuan_ke, j.Catatan,
        p.Mata_Kuliah, p.Shift, p.Assisten, p.Jurusan,
        p.Jam_Mulai, p.Jam_Ahir
      FROM tb_jadwal j
      JOIN tb_praktikum p ON j.ID_Praktikum = p.ID
      WHERE j.Tanggal = ?
    `, [tanggal]);

    await conn.end();

    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Gagal ambil data' }), { status: 500 });
  }
}
