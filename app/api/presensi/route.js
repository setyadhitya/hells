import mysql from "mysql2/promise";
import { verifyToken } from "../../../lib/auth";

export async function POST(req) {
  let connection;
  try {
    // === 1. Ambil token dari cookie ===
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, v] = c.split("=");
        return [k, decodeURIComponent(v)];
      })
    );
    const token = cookies.token;

    if (!token) {
      return new Response(JSON.stringify({ error: "Token tidak ditemukan, login dulu" }), { status: 401 });
    }

    // === 2. Verifikasi token ===
    const user = await verifyToken(token);
    if (!user || user.role !== "praktikan") {
      return new Response(JSON.stringify({ error: "User tidak valid / bukan praktikan" }), { status: 401 });
    }

    // === 3. Ambil kode presensi dan lokasi dari body ===
    const { kode, lokasi } = await req.json();
    if (!kode) {
      return new Response(JSON.stringify({ error: "Kode presensi wajib diisi" }), { status: 400 });
    }
    const lokasiFinal = lokasi || "lokasi_default"; // fallback kalau GPS gagal

    // === 4. Connect ke DB ===
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // === 5. Cek kode presensi aktif ===
    const [kodeRows] = await connection.execute(
      "SELECT * FROM tb_kode_presensi WHERE kode = ? AND status = 'aktif'",
      [kode]
    );
    if (kodeRows.length === 0) {
      return new Response(JSON.stringify({ error: "Kode presensi tidak valid / sudah tidak aktif" }), { status: 400 });
    }
    const kodeData = kodeRows[0];

    const mata_kuliah_id = kodeData.mata_kuliah_id;
    const pertemuan_ke = kodeData.pertemuan_ke;
    const assiten_id = kodeData.generated_by_assisten_id;
    const kode_id = kodeData.id;

    // === 6. Ambil data praktikan dari NIM di token ===
    const [praktikanRows] = await connection.execute(
      "SELECT * FROM tb_praktikan WHERE nim = ?",
      [user.nim]
    );
    if (praktikanRows.length === 0) {
      return new Response(JSON.stringify({ error: "Praktikan tidak ditemukan di database" }), { status: 400 });
    }
    const praktikan_id = praktikanRows[0].id;

    // === 7. Cek apakah praktikan terdaftar pada matakuliah ini (pakai tb_peserta) ===
    const [pesertaRows] = await connection.execute(
      "SELECT * FROM tb_peserta WHERE mata_kuliah_id = ? AND praktikan_id = ?",
      [mata_kuliah_id, praktikan_id]
    );
    if (pesertaRows.length === 0) {
      return new Response(JSON.stringify({ error: "Anda tidak terdaftar pada mata kuliah ini" }), { status: 400 });
    }

    // === 8. Cek duplicate presensi ===
    const [presensiRows] = await connection.execute(
      "SELECT * FROM tb_presensi WHERE praktikan_id = ? AND mata_kuliah_id = ? AND pertemuan_ke = ?",
      [praktikan_id, mata_kuliah_id, pertemuan_ke]
    );
    if (presensiRows.length > 0) {
      return new Response(JSON.stringify({ error: "Anda sudah presensi pada pertemuan ini" }), { status: 400 });
    }

    // === 9. Simpan presensi ===
    await connection.execute(
      `INSERT INTO tb_presensi 
        (praktikan_id, mata_kuliah_id, kode_id, pertemuan_ke, status, lokasi, assisten_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        praktikan_id,
        mata_kuliah_id,
        kode_id,
        pertemuan_ke,
        "hadir",
        lokasiFinal,   // <-- GPS masuk sini
        assiten_id,
      ]
    );

    return new Response(JSON.stringify({ message: "Presensi berhasil disimpan" }), { status: 200 });

  } catch (err) {
    console.error("Error API presensi:", err);
    return new Response(JSON.stringify({ error: "Gagal melakukan presensi" }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
