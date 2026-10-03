import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql()`select id, name, message, reply from wishes order by created_at desc`;
  return Response.json(rows);
}

export async function POST(req: Request) {
  const { name, message } = await req.json();
  if (!name?.trim() || !message?.trim()) {
    return Response.json({ error: "name and message required" }, { status: 400 });
  }
  await sql()`insert into wishes (name, message) values (${name}, ${message})`;
  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id, reply } = await req.json();
  await sql()`update wishes set reply = ${reply?.trim() || null} where id = ${id}`;
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql()`delete from wishes where id = ${id}`;
  return Response.json({ ok: true });
}
