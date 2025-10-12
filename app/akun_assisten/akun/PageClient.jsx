"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function PageClient({ user }) {
  const [profil, setProfil] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  // 🔹 Ambil data profil saat halaman dibuka
  useEffect(() => {
    fetch(`/api/akun_assisten?id=${user.id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProfil(data))
      .catch((err) => console.error("Gagal ambil profil:", err));
  }, [user.id]);

  // 🔹 Ganti field tertentu
  const handleEdit = (field) => {
    setEditMode(field);
    setNewValue("");
    setOldPassword("");
    setStatus("");
    setErrorMsg("");
    setShowNewPassword(false);
    setShowOldPassword(false);
  };

  const handleCancel = () => {
    setEditMode(null);
    setNewValue("");
    setOldPassword("");
    setErrorMsg("");
    setShowNewPassword(false);
    setShowOldPassword(false);
  };

  // 🔹 Validasi & kirim perubahan
  const handleSave = async () => {
    setStatus("loading");
    setErrorMsg("");

    // --- Validasi Nama (hanya huruf, spasi, titik, tanda kutip)
    if (editMode === "nama" && !/^[A-Za-z\s.'-]+$/.test(newValue)) {
      setStatus("error");
      setErrorMsg("Nama hanya boleh huruf dan spasi");
      return;
    }

    // --- Validasi Nomor HP (hanya angka, opsional +)
    if (editMode === "nomorhp" && !/^[0-9+]+$/.test(newValue)) {
      setStatus("error");
      setErrorMsg("Nomor HP hanya boleh berisi angka");
      return;
    }

    // --- Validasi tidak ada perubahan
    if (editMode !== "password" && newValue === profil[editMode]) {
      setStatus("error");
      setErrorMsg(
        `${editMode === "nomorhp" ? "Nomor HP" : "Nama"} baru sama dengan lama`
      );
      return;
    }

    // --- Password wajib input lama
    if (editMode === "password" && !oldPassword) {
      setStatus("error");
      setErrorMsg("Masukkan password lama untuk mengganti password");
      return;
    }

    const payload = { id: user.id, [editMode]: newValue };
    if (editMode === "password") payload.oldPassword = oldPassword;

    // 🔐 Ambil CSRF token dari meta (otomatis dibuat CsrfProvider)
    const csrfToken =
      document.querySelector("meta[name='csrf-token']")?.content || "";

    try {
      const res = await fetch("/api/akun_assisten", {
        method: "PUT",
        credentials: "include", // kirim cookie login
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken, // kirim token CSRF
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        // Jika username berubah → logout paksa agar token diganti
        if (editMode === "username") {
          setStatus("success");
          setTimeout(async () => {
            await fetch("/api/auth_assisten/logout", { method: "POST", credentials: "include" });
            window.location.href = "/login_assisten";
          }, 1000);
          return;
        }

        // Jika bukan ubah username → tetap di halaman
        setProfil((prev) => ({ ...prev, [editMode]: newValue }));
        setStatus("success");
        setTimeout(() => {
          setEditMode(null);
          setNewValue("");
          setOldPassword("");
          setStatus("");
        }, 1000);
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Gagal menyimpan perubahan");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("error");
      setErrorMsg("❌ Terjadi kesalahan koneksi ke server");
    }
  };

  // 🔹 Loading awal
  if (!profil) {
    return (
      <main className="min-h-screen flex justify-center items-center text-gray-600">
        Memuat data profil...
      </main>
    );
  }

  const fields = [
    { key: "username", label: "Username", value: profil.username },
    { key: "nama", label: "Nama", value: profil.nama },
    { key: "nomorhp", label: "Nomor HP", value: profil.nomorhp },
    { key: "password", label: "Password", value: "••••••••" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Profil Akun Asisten
        </h2>

        <div className="space-y-4">
          {fields.map((f) => (
            <div
              key={f.key}
              className="bg-gray-50 rounded-lg p-4 border hover:shadow-sm transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{f.label}</p>
                  <p className="font-medium text-gray-800">{f.value || "-"}</p>
                </div>
                <button
                  onClick={() => handleEdit(f.key)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  Ganti
                </button>
              </div>

              {/* Form edit */}
              <AnimatePresence>
                {editMode === f.key && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 space-y-2"
                  >
                    {/* Password lama */}
                    {editMode === "password" && (
                      <div className="relative">
                        <input
                          type={showOldPassword ? "text" : "password"}
                          placeholder="Masukkan password lama"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowOldPassword((prev) => !prev)
                          }
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showOldPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Input baru */}
                    <div className="relative">
                      <input
                        type={
                          f.key === "password"
                            ? showNewPassword
                              ? "text"
                              : "password"
                            : "text"
                        }
                        placeholder={`Masukkan ${f.label} baru`}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                      />
                      {f.key === "password" && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((prev) => !prev)
                          }
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Tombol aksi */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!newValue || status === "loading"}
                        className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {status === "loading" ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>

                    {/* Pesan status */}
                    {status === "success" && (
                      <p className="text-green-600 text-sm text-right">
                        ✔️ Berhasil disimpan
                      </p>
                    )}
                    {status === "error" && (
                      <p className="text-red-600 text-sm text-right">
                        {errorMsg}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
