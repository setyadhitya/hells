import mysql from 'mysql2/promise';

export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'stern'
    });

    const [rows] = await connection.execute(`
      SELECT m.id AS modul_id, m.judul, m.deskripsi, m.created_at,
             h.id AS halaman_id, h.nomor_halaman, h.isi, h.created_at AS halaman_created,
             g.id AS gambar_id, g.path_gambar, g.keterangan, g.created_at AS gambar_created
      FROM tb_modul m
      LEFT JOIN tb_modul_halaman h ON m.id = h.modul_id
      LEFT JOIN tb_modul_gambar g ON h.id = g.halaman_id
      WHERE m.id = ?
      ORDER BY h.nomor_halaman, g.id
    `, [slug]);

    await connection.end();

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Modul tidak ditemukan" }), { status: 404 });
    }

    // mapping jadi nested object
    const modul = {
      id: rows[0].modul_id,
      judul: rows[0].judul,
      deskripsi: rows[0].deskripsi,
      created_at: rows[0].created_at,
      halaman: []
    };

    rows.forEach(r => {
      if (r.halaman_id) {
        let halaman = modul.halaman.find(h => h.id === r.halaman_id);
        if (!halaman) {
          halaman = {
            id: r.halaman_id,
            nomor_halaman: r.nomor_halaman,
            isi: r.isi,
            created_at: r.halaman_created,
            gambar: []
          };
          modul.halaman.push(halaman);
        }

        if (r.gambar_id) {
          halaman.gambar.push({
            id: r.gambar_id,
            path_gambar: r.path_gambar,
            keterangan: r.keterangan,
            created_at: r.gambar_created
          });
        }
      }
    });

    return Response.json(modul);

  } catch (error) {
    console.error('Gagal ambil detail modul:', error);
    return new Response(JSON.stringify({ error: 'Gagal ambil detail modul' }), { status: 500 });
  }
}
