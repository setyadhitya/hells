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
      SELECT m.id AS modul_id, m.judul, m.deskripsi, m.created_at,
             h.id AS halaman_id, h.nomor_halaman, h.isi, h.created_at AS halaman_created,
             g.id AS gambar_id, g.path_gambar, g.keterangan, g.created_at AS gambar_created
      FROM tb_modul m
      LEFT JOIN tb_modul_halaman h ON m.id = h.modul_id
      LEFT JOIN tb_modul_gambar g ON h.id = g.halaman_id
      ORDER BY m.id, h.nomor_halaman, g.id
    `);

    await connection.end();

    // mapping jadi nested object { modul -> halaman -> gambar }
    const modulMap = {};
    rows.forEach(r => {
      if (!modulMap[r.modul_id]) {
        modulMap[r.modul_id] = {
          id: r.modul_id,
          judul: r.judul,
          deskripsi: r.deskripsi,
          created_at: r.created_at,
          halaman: []
        };
      }

      if (r.halaman_id) {
        let halaman = modulMap[r.modul_id].halaman.find(h => h.id === r.halaman_id);
        if (!halaman) {
          halaman = {
            id: r.halaman_id,
            nomor_halaman: r.nomor_halaman,
            isi: r.isi,
            created_at: r.halaman_created,
            gambar: []
          };
          modulMap[r.modul_id].halaman.push(halaman);
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

    return Response.json(Object.values(modulMap));

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
      `INSERT INTO tb_modul (judul, deskripsi) VALUES (?, ?)`,
      [body.judul, body.deskripsi]
    );

    await connection.end();

    return Response.json({ success: true, id: result.insertId });

  } catch (error) {
    console.error('Gagal tambah modul:', error);
    return new Response(JSON.stringify({ error: 'Gagal tambah modul' }), { status: 500 });
  }
}
