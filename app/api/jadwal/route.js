// ✅ FILE: app/api/jadwal/route.js
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'labordatenbank'
    });

    // Gabungkan tb_jadwal dengan tb_praktikum berdasarkan ID_Praktikum
    const [rows] = await connection.execute(`
      SELECT 
        j.ID, j.Tanggal, j.Pertemuan_ke, j.Catatan,
        p.Hari, p.Jam_Mulai, p.Jam_Ahir, p.Mata_Kuliah, p.Kelas, p.Shift, p.Jurusan, p.Assisten
      FROM tb_jadwal j
      JOIN tb_praktikum p ON j.ID_Praktikum = p.ID
    `);

    await connection.end();
    return Response.json(rows);
  } catch (error) {
    console.error('Gagal ambil data:', error);
    return new Response(JSON.stringify({ error: 'Gagal ambil data' }), { status: 500 });
  }
}