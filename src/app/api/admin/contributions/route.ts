import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const { name, amount, item, note, source } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "name required" }, { status: 400 });
  }
  await sql()`
    insert into contributions (name, amount, item, note, source)
    values (${name}, ${amount ?? null}, ${item ?? null}, ${note ?? null}, ${source ?? null})
  `;
  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  await sql()`update contributions set done = ${done} where id = ${id}`;
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql()`delete from contributions where id = ${id}`;
  return Response.json({ ok: true });
}
