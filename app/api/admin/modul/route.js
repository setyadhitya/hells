import { NextResponse } from "next/server";
import db from "../../../lib/db"; // sesuaikan dengan koneksi database kamu

// GET semua modul atau 1 modul pakai query ?id=
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const modul = await db.modul.findUnique({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(modul || { error: "Data tidak ditemukan" }, { status: modul ? 200 : 404 });
  }

  const all = await db.modul.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(all);
}

// POST tambah modul baru
export async function POST(req) {
  try {
    const data = await req.json();
    const modul = await db.modul.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi,
      },
    });
    return NextResponse.json(modul);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT update modul
export async function PUT(req) {
  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "ID wajib disertakan" }, { status: 400 });
    }
    const modul = await db.modul.update({
      where: { id: parseInt(data.id) },
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi,
      },
    });
    return NextResponse.json(modul);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE hapus modul pakai query ?id=
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID wajib disertakan" }, { status: 400 });
  }

  try {
    await db.modul.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Modul berhasil dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
