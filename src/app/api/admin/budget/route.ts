import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql()`select id, name, cost, bought, note from budget_items order by created_at desc`;
  return Response.json(rows);
}

export async function POST(req: Request) {
  const { name, cost, note } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "name required" }, { status: 400 });
  }
  await sql()`insert into budget_items (name, cost, note) values (${name}, ${cost ?? null}, ${note ?? null})`;
  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id, bought } = await req.json();
  await sql()`update budget_items set bought = ${bought} where id = ${id}`;
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql()`delete from budget_items where id = ${id}`;
  return Response.json({ ok: true });
}
