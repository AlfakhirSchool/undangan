import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { isPhotoSlot } from "@/lib/site-content";

const isPhotoUrl = (u: unknown): u is string =>
  typeof u === "string" && (u.startsWith("/images/") || u.startsWith("https://"));

export async function POST(req: Request) {
  const form = await req.formData();
  const slot = form.get("slot");
  const index = Number(form.get("index"));
  const file = form.get("file");
  if (!isPhotoSlot(slot) || Number.isNaN(index) || !(file instanceof File)) {
    return Response.json({ error: "valid slot, index, file required" }, { status: 400 });
  }

  const blob = await put(`undangan/${slot}-${index}-${Date.now()}`, file, {
    access: "public",
  });

  const s = sql();
  const rows = await s`select urls from photos where slot = ${slot}`;
  const urls: string[] = rows[0]?.urls ?? [];
  // Indeks di luar daftar ditambahkan di akhir supaya tidak ada lubang (null) di tengah.
  urls[Math.min(Math.max(index, 0), urls.length)] = blob.url;
  await s`
    insert into photos (slot, urls) values (${slot}, ${urls})
    on conflict (slot) do update set urls = excluded.urls
  `;

  return Response.json({ ok: true, url: blob.url });
}

/**
 * Hapus satu foto (`index`) atau kembalikan slot ke foto bawaan (`reset: true`).
 * Menghapus foto terakhir membuat daftar kosong yang tersimpan, artinya "sengaja
 * dikosongkan" dan foto bawaan tidak ditampilkan lagi (kecuali cover dan galeri).
 */
export async function DELETE(req: Request) {
  const { slot, index, reset } = await req.json();
  if (!isPhotoSlot(slot)) return Response.json({ error: "valid slot required" }, { status: 400 });
  const s = sql();
  if (reset === true) {
    await s`delete from photos where slot = ${slot}`;
    return Response.json({ ok: true });
  }
  if (!Number.isInteger(index) || index < 0) {
    return Response.json({ error: "index or reset required" }, { status: 400 });
  }
  const rows = await s`select urls from photos where slot = ${slot}`;
  const urls: string[] = rows[0]?.urls ?? [];
  urls.splice(index, 1);
  await s`
    insert into photos (slot, urls) values (${slot}, ${urls})
    on conflict (slot) do update set urls = excluded.urls
  `;
  return Response.json({ ok: true });
}

/** Ganti seluruh daftar foto sebuah slot (mis. menyimpan foto bawaan atau menambahkannya). */
export async function PUT(req: Request) {
  const { slot, urls } = await req.json();
  if (!isPhotoSlot(slot) || !Array.isArray(urls) || !urls.every(isPhotoUrl)) {
    return Response.json({ error: "valid slot and urls required" }, { status: 400 });
  }
  await sql()`
    insert into photos (slot, urls) values (${slot}, ${urls})
    on conflict (slot) do update set urls = excluded.urls
  `;
  return Response.json({ ok: true });
}
