import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    const [rows] = await connection.execute(`
      SELECT id, mata_kuliah, jurusan, kelas, semester, hari, jam_mulai, jam_ahir, shift, assisten, catatan
      FROM tb_praktikum
    `);

    await connection.end();

    const shifts = ["I", "II", "III", "IV", "V"];
    const hariKerja = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    // Buat struktur kosong
    const jadwalMap = {};

    shifts.forEach((s) => {
      jadwalMap[`Shift ${s}`] = {};
      hariKerja.forEach((h) => {
        jadwalMap[`Shift ${s}`][h] = null;
      });
    });

    // Isi data dari database
    rows.forEach((item) => {
      if (!item.shift || !item.hari) return;

      // Normalisasi shift, misal "shift IV" → "Shift IV"
      const shiftKey = item.shift.trim().toUpperCase().replace("SHIFT", "Shift").replace("  ", " ");
      const hariKey = item.hari.trim();

      if (!jadwalMap[shiftKey]) {
        jadwalMap[shiftKey] = {};
      }
      jadwalMap[shiftKey][hariKey] = item;
    });

    return Response.json(jadwalMap);
  } catch (error) {
    console.error("Gagal ambil data:", error);
    return new Response(JSON.stringify({ error: "Gagal ambil data" }), {
      status: 500,
    });
  }
}
