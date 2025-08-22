import mysql from "mysql2/promise";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern", // sesuai file SQL yang kamu upload
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
      Tanggal_Mulai, // 🟢 tanggal awal pertemuan (string "YYYY-MM-DD")
    } = body;

    const conn = await getConnection();

    // Insert praktikum
    const [result] = await conn.execute(
      `INSERT INTO tb_praktikum
      (Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [Mata_Kuliah, Jurusan, Kelas, Semester, Hari, Jam_Mulai, Jam_Ahir, Shift, Assisten, Catatan]
    );

    const newId = result.insertId;

    // 🟢 Generate 10 jadwal pertemuan (setiap 7 hari sekali)
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
