import GambarClient from "./GambarClient";

export default async function Page() {
  // Ambil data gambar
  let gambar = [];
  let modul = [];

  try {
    const resGambar = await fetch("http://localhost:3000/api/gambar_modul", { cache: "no-store" });
    if (resGambar.ok) {
      gambar = await resGambar.json();
    }

    const resModul = await fetch("http://localhost:3000/api/modul", { cache: "no-store" });
    if (resModul.ok) {
      modul = await resModul.json();
    }
  } catch (err) {
    console.error("Error fetch data:", err);
  }

  return <GambarClient gambar={gambar} modul={modul} />;
}
