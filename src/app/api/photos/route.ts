import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql()`select slot, urls from photos`;
  const bySlot: Record<string, string[]> = {};
  for (const r of rows) bySlot[r.slot as string] = r.urls as string[];
  return Response.json(bySlot);
}
