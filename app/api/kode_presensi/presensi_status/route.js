import mysql from "mysql2/promise";
import { verifyToken } from "../../../../lib/auth";

async function getConnection() {
    return await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "stern",
    });
}

export async function GET(req) {
    const conn = await getConnection();
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) throw new Error("Unauthorized");
        const user = await verifyToken(token);
        if (!user) throw new Error("Unauthorized");

        // Ambil kode presensi terbaru buatan asisten ini
        const [rows] = await conn.execute(
            `SELECT kp.*, mk.mata_kuliah
 FROM tb_kode_presensi kp
 JOIN tb_praktikum mk ON kp.mata_kuliah_id = mk.id
 WHERE kp.generated_by_assisten_id = ?
 ORDER BY kp.id DESC
 LIMIT 1`,

            [user.id]
        );

        if (rows.length === 0) {
            return new Response(JSON.stringify({ message: "Belum ada kode presensi." }), {
                status: 404,
            });
        }

        const row = rows[0];
        const created = new Date(row.created_at);
        const now = new Date();
        const selisihMenit = (now - created) / 60000;

        let status = row.status;
        if (selisihMenit > 10 && row.status === "aktif") {
            status = "expired";
            await conn.execute(`UPDATE tb_kode_presensi SET status='expired' WHERE id=?`, [
                row.id,
            ]);
        }

        return new Response(
            JSON.stringify({
                ...row,
                selisihMenit,
                status,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error("GET presensi_status error:", err);
        return new Response(JSON.stringify({ message: err.message }), { status: 500 });
    } finally {
        await conn.end();
    }
}
