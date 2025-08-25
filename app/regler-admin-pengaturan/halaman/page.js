import HalamanClient from "./HalamanClient";

export default async function HalamanPage() {
  // ambil data halaman
  const resHalaman = await fetch("http://localhost:3000/regler-admin-pengaturan/api/halaman", { cache: "no-store" });
  const halaman = await resHalaman.json();

  // ambil data modul untuk dropdown
  const resModul = await fetch("http://localhost:3000/regler-admin-pengaturan/api/modul", { cache: "no-store" });
  const moduls = await resModul.json();

  return <HalamanClient data={halaman} moduls={moduls} />;
}
