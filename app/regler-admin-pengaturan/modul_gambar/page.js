import GambarClient from "./GambarClient";

export default async function Page() {
  let gambar = [];
  let modul = [];
  let halaman = [];

  try {
    const resGambar = await fetch("http://localhost:3000/regler-admin-pengaturan/api/modul_gambar", { cache: "no-store" });
    if (resGambar.ok) gambar = await resGambar.json();

    const resModul = await fetch("http://localhost:3000/regler-admin-pengaturan/api/modul", { cache: "no-store" });
    if (resModul.ok) modul = await resModul.json();

    const resHalaman = await fetch("http://localhost:3000/regler-admin-pengaturan/api/halaman", { cache: "no-store" });
    if (resHalaman.ok) halaman = await resHalaman.json();
  } catch (err) {
    console.error("Error fetch data:", err);
  }

  return <GambarClient data={gambar} modul={modul} halaman={halaman} />;
}
