import { sql } from "@/lib/db";
import { isTextKey } from "@/lib/site-content";

const MAX_LENGTH = 120;

export async function PUT(req: Request) {
  const { key, value } = await req.json();
  if (!isTextKey(key) || typeof value !== "string" || value.length > MAX_LENGTH) {
    return Response.json({ error: `valid key and value up to ${MAX_LENGTH} chars required` }, { status: 400 });
  }
  const s = sql();
  await s`create table if not exists site_texts (key text primary key, value text not null)`;
  await s`
    insert into site_texts (key, value) values (${key}, ${value.trim()})
    on conflict (key) do update set value = excluded.value
  `;
  return Response.json({ ok: true });
}
