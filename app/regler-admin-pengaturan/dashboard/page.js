"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/regler-admin-pengaturan/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok) router.push("/");
        else setUser(d.user);
      });
  }, [router]);

  const logout = async () => {
    await fetch("/regler-admin-pengaturan/api/logout", { method: "POST" });
    router.push("/regler-admin-pengaturan/");
  };

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center text-xl animate-fade-in">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>

        <div className="space-y-3">
          <p className="text-gray-600">
            Welcome,{" "}
            <strong className="text-indigo-600">{user.username}</strong>{" "}
            <span className="text-sm text-gray-500">(role: {user.role})</span>
          </p>

          {user.role === "admin" && (
            <a
              href="/regler-admin-pengaturan/register"
              className="block w-full px-4 py-2 text-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition"
            >
              Open Register
            </a>
          )}

          {user.role === "admin" && (
            <a
              href="/regler-admin-pengaturan/praktikum"
              className="block w-full px-4 py-2 text-center bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
            >
              Jadwal Praktikum
            </a>
          )}

          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
