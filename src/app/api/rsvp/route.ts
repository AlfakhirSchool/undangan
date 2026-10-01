import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql()`select id, name, attend, guests from rsvps order by created_at desc`;
  return Response.json(rows);
}

export async function POST(req: Request) {
  const { name, attend, guests } = await req.json();
  if (!name?.trim() || (attend !== "Hadir" && attend !== "Tidak Hadir")) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
  await sql()`insert into rsvps (name, attend, guests) values (${name}, ${attend}, ${guests ?? 1})`;
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql()`delete from rsvps where id = ${id}`;
  return Response.json({ ok: true });
}
