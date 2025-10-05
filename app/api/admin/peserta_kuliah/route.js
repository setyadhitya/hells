import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// GET: ambil daftar peserta beserta nama praktikan dan nama praktikum
export async function GET() {
  const db = await getConnection();
  const [rows] = await db.execute(`
    SELECT 
      p.id,
      pr.nama AS praktikan,
      k.mata_kuliah AS praktikum,
      p.created_at
    FROM tb_peserta p
    JOIN tb_praktikan pr ON pr.id = p.praktikan_id
    JOIN tb_praktikum k ON k.id = p.praktikum_id
    ORDER BY p.id DESC
  `);
  await db.end();
  return Response.json(rows);
}

// POST: tambah peserta (bisa banyak sekaligus)
export async function POST(req) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return Response.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const db = await getConnection();

    for (const item of body) {
      const { praktikan_id, praktikum_id } = item; // gunakan praktikum_id
      if (!praktikan_id || !praktikum_id) {
        await db.end();
        return Response.json({ error: "Semua field wajib diisi" }, { status: 400 });
      }

      // Hindari duplikat data
      const [cek] = await db.execute(
        "SELECT id FROM tb_peserta WHERE praktikan_id=? AND praktikum_id=?",
        [praktikan_id, praktikum_id]
      );

      if (cek.length === 0) {
        await db.execute(
          "INSERT INTO tb_peserta (praktikan_id, praktikum_id) VALUES (?, ?)",
          [praktikan_id, praktikum_id]
        );
      }
    }

    await db.end();
    return Response.json({ message: "Peserta berhasil ditambahkan" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PUT: update peserta
export async function PUT(req) {
  try {
    const { id, praktikan_id, praktikum_id } = await req.json(); // gunakan praktikum_id
    if (!id || !praktikan_id || !praktikum_id) {
      return Response.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const db = await getConnection();
    await db.execute(
      "UPDATE tb_peserta SET praktikan_id=?, praktikum_id=? WHERE id=?",
      [praktikan_id, praktikum_id, id]
    );
    await db.end();
    return Response.json({ message: "Peserta berhasil diupdate" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: hapus peserta
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const db = await getConnection();
    await db.execute("DELETE FROM tb_peserta WHERE id=?", [id]);
    await db.end();
    return Response.json({ message: "Peserta berhasil dihapus" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
