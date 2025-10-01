"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PendaftaranPage() {
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [nomorhp, setNomorhp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, nama, nim, nomorhp, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setTimeout(() => router.push("/"), 2000); // kembali ke home
      } else {
        setError(data.error || "Request akun gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan server");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRequest}
        className="bg-white p-6 rounded shadow-md w-96 flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold text-gray-700">Request Akun Praktikan</h1>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="NIM"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Nomor HP"
          value={nomorhp}
          onChange={(e) => setNomorhp(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Request Akun
        </button>
      </form>
    </main>
  );
}
