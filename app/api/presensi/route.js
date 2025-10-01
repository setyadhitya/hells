import mysql from "mysql2/promise";
import { verifyToken } from "../../../lib/auth";

export async function POST(req) {
  let connection;
  try {
    // Ambil cookie token dari header
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, v] = c.split("=");
        return [k, decodeURIComponent(v)];
      })
    );
    const token = cookies.token;

    if (!token) {
      console.log("DEBUG: Token tidak ditemukan di cookie");
      return new Response(
        JSON.stringify({ error: "Token tidak ditemukan. Harap login" }),
        { status: 401 }
      );
    }

    // Verifikasi token
    const user = await verifyToken(token);
    console.log("DEBUG: user dari token =", user);

    if (!user || user.role !== "praktikan") {
      console.log("DEBUG: User tidak valid atau bukan praktikan");
      return new Response(
        JSON.stringify({ error: "User tidak valid / bukan praktikan" }),
        { status: 401 }
      );
    }

    // Ambil kode presensi dari body
    const { kode } = await req.json();
    if (!kode) {
      console.log("DEBUG: Kode presensi kosong");
      return new Response(
        JSON.stringify({ error: "Kode presensi harus diisi" }),
        { status: 400 }
      );
    }
    console.log(`DEBUG: Kode diterima = ${kode}`);

    // Connect ke DB
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "stern",
    });

    // 1. Cek kode presensi aktif
    const [kodeRows] = await connection.execute(
      "SELECT * FROM tb_kode_presensi WHERE kode = ? AND status = 'aktif'",
      [kode]
    );
    if (kodeRows.length === 0) {
      console.log("DEBUG: Kode presensi tidak valid atau tidak aktif");
      return new Response(
        JSON.stringify({ error: "Kode presensi tidak valid / tidak aktif" }),
        { status: 400 }
      );
    }
    const kodeData = kodeRows[0];
    const mata_kuliah_id = kodeData.mata_kuliah_id;
    console.log("DEBUG: Kode valid, mata_kuliah_id =", mata_kuliah_id);

    // 2. Cari praktikan dari NIM di token
    const nim = user.nim; // pastikan verifyToken mengembalikan NIM
    if (!nim) {
      console.log("DEBUG: User token tidak memiliki NIM");
      return new Response(
        JSON.stringify({ error: "User tidak memiliki NIM" }),
        { status: 400 }
      );
    }

    const [praktikanRows] = await connection.execute(
      "SELECT * FROM tb_praktikan WHERE nim = ?",
      [nim]
    );
    if (praktikanRows.length === 0) {
      console.log("DEBUG: Praktikan tidak ditemukan di DB, NIM =", nim);
      return new Response(
        JSON.stringify({ error: "Praktikan tidak ditemukan di DB" }),
        { status: 400 }
      );
    }

    const praktikan_id = praktikanRows[0].id; // ID dari tb_praktikan
    console.log("DEBUG: Praktikan ditemukan, id =", praktikan_id);

    // 3. Cek apakah praktikan terdaftar di mata kuliah
    const [pesertaRows] = await connection.execute(
      "SELECT * FROM tb_matakuliah_praktikan WHERE mata_kuliah_id = ? AND praktikan_id = ?",
      [mata_kuliah_id, praktikan_id]
    );
    if (pesertaRows.length === 0) {
      console.log("DEBUG: Praktikan tidak terdaftar di mata kuliah");
      return new Response(
        JSON.stringify({ error: "Anda tidak terdaftar pada mata kuliah ini" }),
        { status: 400 }
      );
    }

    // 4. Cek duplicate presensi
    const [presensiRows] = await connection.execute(
      "SELECT * FROM tb_presensi WHERE praktikan_id = ? AND kode_id = ?",
      [praktikan_id, kodeData.id]
    );
    if (presensiRows.length > 0) {
      console.log("DEBUG: Duplicate presensi ditemukan");
      return new Response(
        JSON.stringify({ error: "Anda sudah melakukan presensi untuk kode ini" }),
        { status: 400 }
      );
    }

    // 5. Simpan presensi
    await connection.execute(
      "INSERT INTO tb_presensi (praktikan_id, mata_kuliah_id, kode_id, status) VALUES (?, ?, ?, ?)",
      [praktikan_id, mata_kuliah_id, kodeData.id, "aktif"]
    );

    console.log(`DEBUG: Presensi berhasil untuk praktikan_id=${praktikan_id}, kode=${kode}`);
    return new Response(
      JSON.stringify({ message: "Presensi berhasil disimpan" }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Error API presensi:", err);
    return new Response(
      JSON.stringify({ error: "Gagal melakukan presensi" }),
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
