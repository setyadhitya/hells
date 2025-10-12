"use client";
import { useEffect } from "react";

/**
 * Komponen global untuk memastikan token CSRF tersedia.
 * - Akan otomatis memanggil /api/csrf
 * - Menyimpan token di <meta name="csrf-token">
 * - Token ini nanti diambil di semua fetch (PUT/POST/DELETE)
 */
export default function CsrfProvider() {
  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/csrf", { credentials: "include" }); // kirim cookie
        if (!res.ok) {
          console.warn("⚠️ Gagal memuat token CSRF");
          return;
        }
        const data = await res.json();

        // Simpan ke <meta name="csrf-token"> agar bisa diakses seluruh halaman
        let meta = document.querySelector("meta[name='csrf-token']");
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "csrf-token";
          document.head.appendChild(meta);
        }
        meta.content = data.token;

        console.log("🔐 CSRF aktif:", data.token.slice(0, 12) + "...");
      } catch (err) {
        console.error("CSRFProvider error:", err);
      }
    };

    getToken();
  }, []);

  return null; // tidak menampilkan apa pun di UI
}
