import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// 🔗 Koneksi database
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_lab",
};

// ======================== CREATE ========================
export async function POST(req) {
  try {
    const { id_praktikum, tanggal, pertemuan } = await req.json();

    const conn = await mysql.createConnection(dbConfig);

    // ✅ Cek apakah jadwal sudah ada (id_praktikum + tanggal + pertemuan)
    const [cek] = await conn.execute(
      "SELECT * FROM tb_jadwal WHERE id_praktikum=? AND tanggal=? AND pertemuan=?",
      [id_praktikum, tanggal, pertemuan]
    );

    if (cek.length > 0) {
      await conn.end();
      return NextResponse.json(
        { message: "❌ Jadwal sudah ada (tabrakan)" },
        { status: 400 }
      );
    }

    // ✅ Insert data
    await conn.execute(
      "INSERT INTO tb_jadwal (id_praktikum, tanggal, pertemuan) VALUES (?, ?, ?)",
      [id_praktikum, tanggal, pertemuan]
    );

    await conn.end();
    return NextResponse.json({ message: "✅ Jadwal berhasil ditambahkan" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ======================== READ ========================
export async function GET() {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT j.ID, j.tanggal, j.pertemuan, p.nama_praktikum 
       FROM tb_jadwal j 
       JOIN tb_praktikum p ON j.id_praktikum = p.ID
       ORDER BY j.tanggal ASC`
    );
    await conn.end();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ======================== UPDATE ========================
export async function PUT(req) {
  try {
    const { ID, id_praktikum, tanggal, pertemuan } = await req.json();

    const conn = await mysql.createConnection(dbConfig);

    // ✅ Cek apakah jadwal bentrok (selain ID yang sedang diedit)
    const [cek] = await conn.execute(
      "SELECT * FROM tb_jadwal WHERE id_praktikum=? AND tanggal=? AND pertemuan=? AND ID<>?",
      [id_praktikum, tanggal, pertemuan, ID]
    );

    if (cek.length > 0) {
      await conn.end();
      return NextResponse.json(
        { message: "❌ Jadwal tabrakan dengan data lain" },
        { status: 400 }
      );
    }

    await conn.execute(
      "UPDATE tb_jadwal SET id_praktikum=?, tanggal=?, pertemuan=? WHERE ID=?",
      [id_praktikum, tanggal, pertemuan, ID]
    );

    await conn.end();
    return NextResponse.json({ message: "✅ Jadwal berhasil diperbarui" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ======================== DELETE ========================
export async function DELETE(req) {
  try {
    const { ID } = await req.json();

    const conn = await mysql.createConnection(dbConfig);
    await conn.execute("DELETE FROM tb_jadwal WHERE ID=?", [ID]);

    await conn.end();
    return NextResponse.json({ message: "🗑️ Jadwal berhasil dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
