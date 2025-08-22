"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("praktikan");
  const [msg, setMsg] = useState("");

  // 🔒 Client-side auth: hanya admin yang bisa akses halaman ini
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (!token || userRole !== "admin") {
      router.push("/");
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // kirim token ke API
    if (!token) {
      setMsg("Unauthorized");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("User created successfully!");
      router.push("/admin/dashboard"); // redirect ke dashboard admin
    } else {
      setMsg(data.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Register - <span className="text-indigo-600">Admin Only</span>
        </h1>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="admin">admin</option>
              <option value="laboran">laboran</option>
              <option value="asisten">asisten</option>
              <option value="praktikan">praktikan</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition"
          >
            Create User
          </button>

          {msg && <p className="text-red-500 text-sm text-center">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
