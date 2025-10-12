// app/api/presensi/route.js
import mysql from "mysql2/promise";
import { verifyToken } from "../../../lib/auth";

export async function POST(req) {
  let connection;
  try {
    // 1️⃣ Ambil token dari cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, v] = c.split("=");
        return [k, decodeURIComponent(v)];
      })
    );
    const token = cookies.token;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token tidak ditemukan, silakan login dulu." }),
        { status: 401 }
      );
    }

    // 2️⃣ Verifikasi token
    const user = await verifyToken(token);
    if (!user || user.role !== "praktikan") {
      return new Response(
        JSON.stringify({ error: "User tidak valid atau bukan praktikan." }),
        { status: 403 }
      );
    }

    // 3️⃣ Ambil kode & lokasi dari body
    const { kode, lokasi } = await req.json();
    if (!kode) {
      return new Response(
        JSON.stringify({ error: "Kode presensi wajib diisi." }),
        { status: 400 }
      );
    }
    const lokasiFinal = lokasi || "Tidak ada lokasi (GPS gagal)";

    // 4️⃣ Koneksi ke database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 5️⃣ Cek kode presensi aktif
    const [kodeRows] = await connection.execute(
      "SELECT * FROM tb_kode_presensi WHERE kode = ? AND status = 'aktif'",
      [kode]
    );

    if (kodeRows.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Kode presensi tidak valid atau sudah tidak aktif.",
        }),
        { status: 400 }
      );
    }

    const kodeData = kodeRows[0];
    const { id: kode_id, praktikum_id, pertemuan_ke, generated_by_assisten_id } = kodeData;

    // 6️⃣ Ambil data praktikan berdasarkan NIM dari token
    const [praktikanRows] = await connection.execute(
      "SELECT id, nama FROM tb_praktikan WHERE nim = ?",
      [user.nim]
    );

    if (praktikanRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Data praktikan tidak ditemukan di database." }),
        { status: 404 }
      );
    }

    const praktikan_id = praktikanRows[0].id;
    const nama_praktikan = praktikanRows[0].nama;

    // 7️⃣ Pastikan praktikan terdaftar di praktikum tersebut
    const [pesertaRows] = await connection.execute(
      "SELECT * FROM tb_peserta WHERE praktikum_id = ? AND praktikan_id = ?",
      [praktikum_id, praktikan_id]
    );

    if (pesertaRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Anda tidak terdaftar dalam praktikum ini." }),
        { status: 403 }
      );
    }

    // 8️⃣ Cegah presensi ganda
    const [presensiRows] = await connection.execute(
      "SELECT * FROM tb_presensi WHERE praktikan_id = ? AND praktikum_id = ? AND pertemuan_ke = ?",
      [praktikan_id, praktikum_id, pertemuan_ke]
    );

    if (presensiRows.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Anda sudah melakukan presensi pada pertemuan ini.",
        }),
        { status: 409 }
      );
    }

    // 9️⃣ Ambil nama mata kuliah dari tabel tb_praktikum
    const [praktikumRows] = await connection.execute(
      "SELECT mata_kuliah, kelas, shift, hari, jam_mulai FROM tb_praktikum WHERE id = ?",
      [praktikum_id]
    );

    const praktikumInfo = praktikumRows.length > 0 ? praktikumRows[0] : null;
    const nama_praktikum = praktikumInfo?.mata_kuliah || "Praktikum Tidak Dikenal";

    // 🔟 Simpan presensi ke database
    await connection.execute(
      `INSERT INTO tb_presensi 
        (praktikan_id, praktikum_id, kode_id, pertemuan_ke, status, lokasi, assisten_id, created_at)
       VALUES (?, ?, ?, ?, 'hadir', ?, ?, NOW())`,
      [praktikan_id, praktikum_id, kode_id, pertemuan_ke, lokasiFinal, generated_by_assisten_id]
    );

    // ✅ Respons sukses dengan info tambahan
    const tanggal = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Presensi berhasil disimpan!",
        detail: {
          nama_praktikan,
          nama_praktikum,
          kelas: praktikumInfo?.kelas || "-",
          shift: praktikumInfo?.shift || "-",
          hari: praktikumInfo?.hari || "-",
          jam_mulai: praktikumInfo?.jam_mulai || "-",
          pertemuan_ke,
          waktu: tanggal,
          lokasi: lokasiFinal,
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("🔥 PRESENSI ERROR:", err);
    return new Response(
      JSON.stringify({
        error: `Terjadi kesalahan server: ${err.message}`,
      }),
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
