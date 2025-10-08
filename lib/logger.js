import mysql from "mysql2/promise";

async function getConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "stern",
  });
}

/**
 * logAudit({ userId, username, action, ip, userAgent, meta })
 */
export async function logAudit({ userId = null, username = null, action, ip = null, userAgent = null, meta = null }) {
  try {
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO tb_audit_log (user_id, username, action, ip, user_agent, meta) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, username, action, ip, userAgent, meta ? JSON.stringify(meta) : null]
    );
    await conn.end();
  } catch (err) {
    // Jangan lempar error ke user kalau logging gagal, hanya console
    console.error("logAudit error:", err);
  }
}
