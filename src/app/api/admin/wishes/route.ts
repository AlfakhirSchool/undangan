import { sql } from "@/lib/db";

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
