// lib/useFetchSecure.js
// Helper fetch otomatis menambahkan token CSRF & credentials
export async function fetchSecure(url, options = {}) {
  // Ambil token CSRF dari cookie
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  const defaultHeaders = {
    ...(options.headers || {}),
    "x-csrf-token": csrfToken || "",
  };

  const res = await fetch(url, {
    credentials: "include", // penting: kirim cookie token
    ...options,
    headers: defaultHeaders,
  });

  return res;
}
