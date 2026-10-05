import { sql } from "@/lib/db";

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await sql()`delete from rsvps where id = ${id}`;
  return Response.json({ ok: true });
}
