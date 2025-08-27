"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/me", {
        credentials: "include", // ✅ wajib biar cookie ikut
      });
      const data = await res.json();

      if (!data.ok) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); // ✅ sertakan cookie
    router.push("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Profil Praktikan</h1>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}
