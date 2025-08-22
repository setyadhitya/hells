// app/api/jadwal/route.js
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
      SELECT Mata_Kuliah, Hari, Shift
      FROM tb_praktikum
    `);

    await connection.end();

    // Susun data menjadi { Shift: { Senin: '...', Selasa: '...', ... } }
    const shifts = ['I','II','III','IV','V'];
    const hariKerja = ['Senin','Selasa','Rabu','Kamis','Jumat'];

    const jadwalMap = {};

    shifts.forEach(shift => {
      jadwalMap[shift] = {};
      hariKerja.forEach(hari => {
        jadwalMap[shift][hari] = '-'; // default
      });
    });

    rows.forEach(item => {
      if (jadwalMap[item.Shift] && item.Hari) {
        jadwalMap[item.Shift][item.Hari] = item.Mata_Kuliah;
      }
    });

    return Response.json(jadwalMap);

  } catch (error) {
    console.error('Gagal ambil data:', error);
    return new Response(JSON.stringify({ error: 'Gagal ambil data' }), { status: 500 });
  }
}
