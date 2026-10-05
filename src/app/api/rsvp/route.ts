import { sql } from "@/lib/db";

const MAX_GUESTS = 10;

export async function GET() {
  const rows = await sql()`select id, name, attend, guests from rsvps order by created_at desc`;
  return Response.json(rows);
}

export async function POST(req: Request) {
  const { name, attend, guests } = await req.json();
  if (!name?.trim() || (attend !== "Hadir" && attend !== "Tidak Hadir")) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
  if (attend === "Hadir" && !(Number.isInteger(guests) && guests >= 1 && guests <= MAX_GUESTS)) {
    return Response.json({ error: `guests must be 1-${MAX_GUESTS}` }, { status: 400 });
  }
  const count = attend === "Hadir" ? guests : 0;
  await sql()`insert into rsvps (name, attend, guests) values (${name.trim()}, ${attend}, ${count})`;
  return Response.json({ ok: true });
}
