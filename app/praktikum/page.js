import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import PraktikumClient from "./PraktikumClient";

async function getUser() {
  const cookieStore = await cookies(); // ✅ await cookies()
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "devsecret");
  } catch {
    return null;
  }
}

export default async function PraktikumPage() {
  const user = await getUser();

  if (!user || !["admin", "laboran", "asisten"].includes(user.role)) {
    return <meta httpEquiv="refresh" content="0; url=/" />;
  }

  const cookieStore = await cookies();
  const res = await fetch("http://localhost:3000/api/praktikum", {
    cache: "no-store",
    headers: { Cookie: cookieStore.toString() },
  });
  const data = await res.json();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📚 Daftar Praktikum
        </h1>

        <p className="text-gray-600 mb-6">
          Halo,{" "}
          <span className="font-semibold text-indigo-600">{user.username}</span>{" "}
          <span className="text-sm text-gray-500">(role: {user.role})</span>
        </p>

        {/* Client component untuk render data */}
        <PraktikumClient data={data} user={user} />
      </div>
    </div>
  );
}
