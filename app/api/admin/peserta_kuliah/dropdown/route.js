// app/api/admin/peserta_kuliah/dropdown/route.js
import mysql from "mysql2/promise";
import { secureHandler } from "../../../../../lib/secureApi";

async function getConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stern",
  });
}

export async function GET(req) {
  return secureHandler(req, {
    requireAuth: true,
    rateLimit: true,
    handler: async () => {
      const db = await getConnection();
      const [praktikan] = await db.execute(
        "SELECT id, nama FROM tb_praktikan ORDER BY nama ASC"
      );
      const [praktikum] = await db.execute(
        "SELECT id, mata_kuliah FROM tb_praktikum ORDER BY mata_kuliah ASC"
      );
      await db.end();
      return { praktikan, praktikum };
    },
  });
}
