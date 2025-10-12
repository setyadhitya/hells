"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔹 Fungsi untuk kirim form login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth_assisten/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🧩 penting agar cookie token tersimpan
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Gagal login → tampilkan pesan error
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      // Login sukses → arahkan ke halaman akun
      alert("Login berhasil, selamat datang!");
      router.push("/akun_assisten");
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== 🔹 Tampilan form login ====================
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-lg w-80 flex flex-col gap-4 border"
      >
        <h1 className="text-xl font-bold text-center text-gray-700">Login Asisten</h1>

        {/* Pesan Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Input Username */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Input Password */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded text-white font-semibold transition ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Memproses..." : "Login"}
        </button>

        <p className="text-xs text-center text-gray-500">
          © 2025 Laboratorium Informatika - Sistem Asisten
        </p>
      </form>
    </main>
  );
}
