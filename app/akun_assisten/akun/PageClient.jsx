// app/akun_assisten/akun/PageClient.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
  import { fetchSecure } from "../../../lib/useFetchSecure.js";

export default function PageClient({ user }) {
  const [profil, setProfil] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  // 🔹 Ambil data profil asisten dari API
  useEffect(() => {
    fetch(`/api/akun_assisten?id=${user.id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProfil(data))
      .catch((err) => console.error("Gagal ambil profil:", err));
  }, [user.id]);

  // 🔹 Mulai mode edit
  const handleEdit = (field) => {
    setEditMode(field);
    setNewValue("");
    setOldPassword("");
    setStatus("");
    setErrorMsg("");
  };

  const handleCancel = () => {
    setEditMode(null);
    setNewValue("");
    setOldPassword("");
    setErrorMsg("");
  };

  // 🔹 Simpan perubahan profil

const handleSave = async () => {
  setStatus("loading");
  setErrorMsg("");

  const payload = { id: user.id, [editMode]: newValue };
  if (editMode === "password") payload.oldPassword = oldPassword;

  try {
    const res = await fetchSecure("/api/akun_assisten", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (res.ok) {
      setProfil((prev) => ({ ...prev, [editMode]: newValue }));
      setStatus("success");
      setTimeout(() => {
        setEditMode(null);
        setNewValue("");
        setOldPassword("");
        setStatus("");
      }, 1200);
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Gagal menyimpan perubahan");
    }
  } catch (err) {
    console.error("Update error:", err);
    setStatus("error");
    setErrorMsg("Gagal terhubung ke server");
  }
};


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

  // 🔹 Tampilan utama halaman profil
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

              {/* Form edit dinamis */}
              <AnimatePresence>
                {editMode === f.key && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 space-y-2"
                  >
                    {/* Input password lama */}
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
                          onClick={() => setShowOldPassword((prev) => !prev)}
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    </div>

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
