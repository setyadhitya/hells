import mysql from "mysql2/promise";

try {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });

  console.log("✅ Koneksi ke MySQL berhasil!");
  const [rows] = await conn.query("SHOW TABLES;");
  console.log("📋 Daftar tabel:", rows);
  await conn.end();
} catch (err) {
  console.error("❌ Gagal koneksi:", err.message);
}
