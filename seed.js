// seed.js
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

async function seed() {
  const connection = await mysql.createConnection({
    host: "localhost",   // ganti sesuai config MySQL kamu
    user: "root",        // ganti sesuai config MySQL kamu
    password: "",        // ganti sesuai config MySQL kamu
    database: "stern"  // ganti sesuai nama database kamu
  });

  const username = "buah";
  const plainPassword = "naga";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // cek apakah user sudah ada
  const [rows] = await connection.execute(
    "SELECT * FROM tb_users WHERE username = ?",
    [username]
  );

  if (rows.length > 0) {
    console.log("User sudah ada, update password...");
    await connection.execute(
      "UPDATE tb_users SET password = ? WHERE username = ?",
      [hashedPassword, username]
    );
  } else {
    console.log("User belum ada, buat baru...");
    await connection.execute(
      "INSERT INTO tb_users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
  }

  console.log(`✅ User '${username}' dibuat/diupdate dengan password '${plainPassword}'`);
  await connection.end();
}

seed().catch(err => {
  console.error("❌ Error saat seed:", err);
});
