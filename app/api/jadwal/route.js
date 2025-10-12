import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 🔹 Ambil data praktikum + peserta + asisten
    const [rows] = await connection.execute(`
      SELECT 
        p.id,
        p.mata_kuliah,
        p.jurusan,
        p.kelas,
        p.semester,
        p.hari,
        p.jam_mulai,
        p.jam_ahir,
        p.shift,
        p.catatan,
        COUNT(DISTINCT ps.id) AS peserta,
        GROUP_CONCAT(DISTINCT pr.nama ORDER BY pr.nama SEPARATOR ', ') AS daftar_peserta,
        GROUP_CONCAT(DISTINCT a.nama ORDER BY a.nama SEPARATOR ', ') AS daftar_assisten
      FROM tb_praktikum p
      LEFT JOIN tb_peserta ps ON ps.praktikum_id = p.id
      LEFT JOIN tb_praktikan pr ON pr.id = ps.praktikan_id
      LEFT JOIN tb_assisten_praktikum ap ON ap.praktikum_id = p.id
      LEFT JOIN tb_assisten a ON a.id = ap.assisten_id
      GROUP BY 
        p.id, p.mata_kuliah, p.jurusan, p.kelas, p.semester, 
        p.hari, p.jam_mulai, p.jam_ahir, p.shift, p.catatan
      ORDER BY p.shift, p.hari
    `);

    await connection.end();

    const shifts = ["I", "II", "III", "IV", "V"];
    const hariKerja = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    const jadwalMap = {};
    shifts.forEach((s) => {
      jadwalMap[`Shift ${s}`] = {};
      hariKerja.forEach((h) => {
        jadwalMap[`Shift ${s}`][h] = null;
      });
    });

    // Isi data
    rows.forEach((item) => {
      if (!item.shift || !item.hari) return;

      const shiftKey = item.shift.trim().toUpperCase().replace("SHIFT", "Shift");
      const hariKey = item.hari.trim();

      jadwalMap[shiftKey][hariKey] = {
        ...item,
        peserta: Number(item.peserta) || 0,
        daftar_peserta: item.daftar_peserta || "",
        daftar_assisten: item.daftar_assisten || "",
      };
    });

    return Response.json(jadwalMap);
  } catch (error) {
    console.error("Gagal ambil data:", error);
    return new Response(JSON.stringify({ error: "Gagal ambil data" }), {
      status: 500,
    });
  }
}
