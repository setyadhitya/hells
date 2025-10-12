lib/auth.js
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Helper untuk dapatkan kunci
function getSecretKey() {
return new TextEncoder().encode(JWT_SECRET);
}

export async function signToken(payload) {
return await new SignJWT(payload)
.setProtectedHeader({ alg: "HS256" })
.setIssuedAt()
.setExpirationTime("1h")
.sign(getSecretKey());
}

export async function verifyToken(token) {
try {
const { payload } = await jwtVerify(token, getSecretKey());
return payload;
} catch (err) {
console.error("❌ verifyToken error:", err.message);
return null;
}
}

lib/csrf.js
import crypto from "crypto";
import * as cookie from "cookie";

/**
 * Membuat dan mengembalikan header "Set-Cookie" untuk token CSRF.
 * Ini digunakan di secureHandler agar response bisa menambahkan cookie.
 */
export async function ensureCsrfCookie(req) {
try {
const cookieHeader = req.headers.get("cookie") || "";
const parsed = cookie.parse(cookieHeader || "");

// Jika sudah ada token CSRF di cookie, kembalikan token itu
if (parsed.csrf_token) {
return { token: parsed.csrf_token, setCookie: null };
}

// Jika belum ada token, buat token baru
const token = crypto.randomBytes(32).toString("hex");
const setCookie = cookie.serialize("csrf_token", token, {
httpOnly: false, // frontend boleh akses
secure: true,
sameSite: "none",
path: "/",
maxAge: 60 * 60 * 24, // 1 hari
});

return { token, setCookie };
} catch (err) {
console.error("ensureCsrfCookie error:", err);
return { token: null, setCookie: null };
}
}

/**
 * Verifikasi token CSRF dari cookie dan header.
 */
export async function verifyCsrf(req) {
try {
const cookieHeader = req.headers.get("cookie") || "";
const parsed = cookie.parse(cookieHeader || "");
const cookieToken = parsed.csrf_token;
const headerToken =
req.headers.get("x-csrf-token") ||
req.headers.get("x-xsrf-token") ||
null;

if (!cookieToken || !headerToken) return false;

return crypto.timingSafeEqual(
Buffer.from(cookieToken),
Buffer.from(headerToken)
);
} catch (err) {
console.error("verifyCsrf error:", err);
return false;
}
}

lib/db.js
// /lib/db.ts
import mysql from 'mysql2/promise'

export const db = await mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'stern',
})

lib/logger.js
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

lib/requireRole.js
import { cookies, headers } from "next/headers"
import { verifyToken } from "./auth"
import { redirect } from "next/navigation"

export async function requireRole(allowedRoles = []) {
const cookieStore = await cookies()
const token = cookieStore.get("token")?.value || null
const user = token ? await verifyToken(token) : null

if (!user) {
// Ambil path saat ini pakai await
const headersList = await headers()
const currentPath = headersList.get("x-invoke-path") || ""

redirect(`/regler-admin-pengaturan/login?redirect=${encodeURIComponent(currentPath)}`)
}

if (!allowedRoles.includes(user.role)) {
if (user.role === "praktikan") {
redirect("/profil")
} else if (user.role === "admin") {
redirect("/regler-admin-pengaturan/dashboard")
} else {
redirect("/") // fallback
}
}

return user
}

lib/secureApi.js
import { verifyToken } from "../lib/auth";
import { headers as nextHeaders, cookies as nextCookies } from "next/headers";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { verifyCsrf, ensureCsrfCookie } from "../lib/csrf";
import { logAudit } from "../lib/logger";
import * as cookie from "cookie";

const rateLimiter = new RateLimiterMemory({
points: 60, // maksimal 60 request
duration: 60, // per 60 detik
});

export async function secureHandler(
req,
{
requireAuth = false,
rateLimit = false,
allowedOrigins = ["http://localhost:3000", "https://localhost:3000"],
requireCsrf = false,
handler,
}
) {
try {
console.log("🟡 secureHandler start, requireAuth:", requireAuth);

const hdrs = await nextHeaders();
const cks = await nextCookies();

const ip =
hdrs.get("x-forwarded-for") ||
hdrs.get("cf-connecting-ip") ||
"unknown";

// 🛑 Rate limit
if (rateLimit) {
try {
await rateLimiter.consume(ip);
} catch {
return new Response(
JSON.stringify({ message: "Terlalu banyak permintaan, coba lagi nanti." }),
{
status: 429,
headers: { "Retry-After": "60" },
}
);
}
}

// 🔒 Origin & Referer check
const origin = hdrs.get("origin");
const referer = hdrs.get("referer");

if (origin && !allowedOrigins.some((o) => origin.startsWith(o))) {
return new Response(
JSON.stringify({ message: "Akses tidak diizinkan (Origin mismatch)" }),
{ status: 403 }
);
}

if (referer && !allowedOrigins.some((o) => referer.startsWith(o))) {
return new Response(
JSON.stringify({ message: "Akses tidak diizinkan (Referer mismatch)" }),
{ status: 403 }
);
}

const method = req.method?.toUpperCase() || "GET";

// 🧿 Pastikan cookie CSRF tersedia
const { token: csrfToken, setCookie } = await ensureCsrfCookie(req);

// Jika butuh verifikasi CSRF
if (requireCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
const valid = await verifyCsrf(req);
if (!valid) {
await logAudit({
userId: null,
username: null,
action: "csrf_failed",
ip,
userAgent: hdrs.get("user-agent") || null,
});
return new Response(JSON.stringify({ message: "CSRF token invalid" }), {
status: 403,
});
}
}

// 🔑 JWT Auth
let user = null;
if (requireAuth) {
const token = cks.get("token")?.value;
user = token ? await verifyToken(token) : null;
if (!user) {
return new Response(
JSON.stringify({
message: "Akses ditolak! Anda tidak memiliki izin untuk mengakses resource ini.",
advice: "Jangan mengambil hak orang lain tanpa izin. Sesuai firman Allah: 'Dan janganlah sebagian kamu memakan harta sebagian yang lain di antara kamu dengan jalan yang batil.' (QS. Al-Baqarah:188)",
hadith: "Rasulullah ﷺ bersabda: 'Barang siapa menipu kami bukan dari golongan kami.' (HR. Muslim)"
}),

{ status: 401 }
);
}
}

// 🚀 Jalankan handler API
const handlerResp = await handler({ req, user, ip, logAudit });

// 🧩 Gabungkan hasil handler dengan Set-Cookie CSRF (jika ada)
const headers = { "Content-Type": "application/json" };
if (setCookie) headers["Set-Cookie"] = setCookie;

if (handlerResp instanceof Response) {
if (setCookie) handlerResp.headers.set("Set-Cookie", setCookie);
return handlerResp;
} else {
return new Response(JSON.stringify(handlerResp), {
status: 200,
headers,
});
}
} catch (err) {
console.error("secureHandler error:", err);
return new Response(JSON.stringify({ message: "Server error" }), {
status: 500,
});
}
}
