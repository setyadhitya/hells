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
