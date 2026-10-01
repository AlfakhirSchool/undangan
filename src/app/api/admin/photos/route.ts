import { put } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const slot = form.get("slot") as string;
  const index = Number(form.get("index"));
  const file = form.get("file") as File;
  if (!slot || Number.isNaN(index) || !file) {
    return Response.json({ error: "slot, index, file required" }, { status: 400 });
  }

  const blob = await put(`undangan/${slot}-${index}-${Date.now()}`, file, {
    access: "public",
  });

  const s = sql();
  const rows = await s`select urls from photos where slot = ${slot}`;
  const urls: string[] = rows[0]?.urls ?? [];
  urls[index] = blob.url;
  await s`
    insert into photos (slot, urls) values (${slot}, ${urls})
    on conflict (slot) do update set urls = excluded.urls
  `;

  return Response.json({ ok: true, url: blob.url });
}
