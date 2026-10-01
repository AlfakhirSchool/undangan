import { sql } from "@/lib/db";

export async function GET() {
  const s = sql();
  const [wishes, rsvps, contributions] = await Promise.all([
    s`select id, name, message, created_at from wishes order by created_at desc`,
    s`select name, attend, guests, created_at from rsvps order by created_at desc`,
    s`select id, name, amount, item, note, source, done, created_at from contributions order by created_at desc`,
  ]);
  return Response.json({ wishes, rsvps, contributions });
}
