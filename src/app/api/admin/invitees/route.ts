import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql()`select id, name, type, category from invitees order by category asc, name asc`;
  return Response.json(rows);
}

export async function POST(req: Request) {
  const { name, type, category } = await req.json();
  if (!name?.trim() || (type !== "digital" && type !== "fisik")) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
  await sql()`insert into invitees (name, type, category) values (${name}, ${type}, ${category?.trim() || "Umum"})`;
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql()`delete from invitees where id = ${id}`;
  return Response.json({ ok: true });
}
