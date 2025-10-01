"use client"; 
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");   // input username
  const [password, setPassword] = useState("");   // input password
  const [error, setError] = useState("");         // pesan error jika login gagal
  const router = useRouter();

  // 🔹 Fungsi untuk submit login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Kirim data ke API login
      const res = await fetch("/api/auth_assisten/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Jika sukses, redirect ke /akun-assisten
        router.push("/akun-assisten");
      } else {
        setError(data.error || "Login gagal");
      }
    } catch (err) {
      setError("Gagal login, coba lagi");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80 flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold text-gray-700">Login Praktikan</h1>

        {/* Pesan error */}
        {error && <p className="text-red-600">{error}</p>}

        {/* Input username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {/* Input password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {/* Tombol submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>

        {/* Link ke halaman registrasi */}
        <p className="text-sm text-gray-500 mt-2">
          Belum punya akun?{" "}
          <a
            href="/pendaftaran"
            className="text-blue-600 hover:underline"
          >
            Daftar sekarang
          </a>
        </p>
      </form>
    </main>
  );
}
