import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

// 🔹 GET semua praktikum
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM tb_praktikum");
    await conn.end();
    return Response.json(rows);
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(JSON.stringify({ error: "Gagal ambil data" }), { status: 500 });
  }
}

// 🔹 POST tambah praktikum + generate jadwal 10 pertemuan
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      Mata_Kuliah,
      Jurusan,
      Kelas,
      Semester,
      Hari,
      Jam_Mulai,
      Jam_Ahir,
      Shift,
      Assisten,
      Catatan,
      Tanggal_Mulai, // 🟢 tanggal awal pertemuan
    } = body;

    const conn = await getConnection();

    // 🚨 Cek duplikasi praktikum (mata kuliah + kelas)
    const [duplikasi] = await conn.execute(
      `SELECT ID FROM tb_praktikum 
       WHERE Mata_Kuliah = ? AND Kelas = ?`,
      [Mata_Kuliah, Kelas]
    );

    if (duplikasi.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Praktikum ${Mata_Kuliah} untuk kelas ${Kelas} sudah ada` }),
        { status: 400 }
      );
    }

    // 🚨 Cek tabrakan hari + shift
    const [bentrok] = await conn.execute(
      `SELECT ID FROM tb_praktikum 
       WHERE Hari = ? AND Shift = ?`,
      [Hari, Shift]
    );

    if (bentrok.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Sudah ada praktikum di hari ${Hari}, shift ${Shift}` }),
        { status: 400 }
      );
    }

    // ✅ Insert praktikum baru
    const [result] = await conn.execute(
      `INSERT INTO tb_praktikum
      (Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan]
    );

    const newId = result.insertId;

    // ✅ Generate 10 jadwal otomatis
    let tanggalAwal = new Date(Tanggal_Mulai);
    for (let i = 1; i <= 10; i++) {
      let tanggal = new Date(tanggalAwal);
      tanggal.setDate(tanggalAwal.getDate() + (i - 1) * 7);

      await conn.execute(
        `INSERT INTO tb_jadwal (ID_Praktikum, Tanggal, Pertemuan_ke, Catatan)
         VALUES (?,?,?,NULL)`,
        [newId, tanggal.toISOString().split("T")[0], i]
      );
    }

    await conn.end();
    return Response.json({ message: "Praktikum & jadwal berhasil ditambahkan", id: newId });
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(JSON.stringify({ error: "Gagal tambah data" }), { status: 500 });
  }
}

// 🔹 PUT update praktikum
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      ID,
      Mata_Kuliah,
      Jurusan,
      Kelas,
      Semester,
      Hari,
      Jam_Mulai,
      Jam_Ahir,
      Shift,
      Assisten,
      Catatan,
    } = body;

    const conn = await getConnection();

    // 🚨 Cek duplikasi saat update (kecuali ID yg sama)
    const [duplikasi] = await conn.execute(
      `SELECT ID FROM tb_praktikum 
       WHERE Mata_Kuliah = ? AND Kelas = ? AND ID != ?`,
      [Mata_Kuliah, Kelas, ID]
    );

    if (duplikasi.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Praktikum ${Mata_Kuliah} untuk kelas ${Kelas} sudah ada` }),
        { status: 400 }
      );
    }

    // 🚨 Cek tabrakan hari + shift (kecuali ID yg sama)
    const [bentrok] = await conn.execute(
      `SELECT ID FROM tb_praktikum 
       WHERE Hari = ? AND Shift = ? AND ID != ?`,
      [Hari, Shift, ID]
    );

    if (bentrok.length > 0) {
      await conn.end();
      return new Response(
        JSON.stringify({ error: `Sudah ada praktikum di hari ${Hari}, shift ${Shift}` }),
        { status: 400 }
      );
    }

    await conn.execute(
      `UPDATE tb_praktikum
       SET Mata_Kuliah=?, Jurusan=?, Kelas=?, Semester=?, Hari=?, Jam_Mulai=?, Jam_Ahir=?, Shift=?, Assisten=?, Catatan=?
       WHERE ID=?`,
      [Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan, ID]
    );

    await conn.end();
    return Response.json({ message: "Praktikum berhasil diperbarui" });
  } catch (err) {
    console.error("PUT Error:", err);
    return new Response(JSON.stringify({ error: "Gagal update data" }), { status: 500 });
  }
}

// 🔹 DELETE hapus praktikum
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const conn = await getConnection();
    await conn.execute("DELETE FROM tb_praktikum WHERE ID=?", [id]);
    await conn.end();

    return Response.json({ message: "Praktikum berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Error:", err);
    return new Response(JSON.stringify({ error: "Gagal hapus data" }), { status: 500 });
  }
}
