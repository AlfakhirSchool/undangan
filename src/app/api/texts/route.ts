import { sql } from "@/lib/db";

const UNDEFINED_TABLE = "42P01";

export async function GET() {
  let rows: Record<string, unknown>[] = [];
  try {
    rows = await sql()`select key, value from site_texts`;
  } catch (e) {
    // Tabel baru dibuat saat teks pertama kali disimpan dari admin; sebelum itu dianggap kosong.
    const missingTable = typeof e === "object" && e !== null && "code" in e && e.code === UNDEFINED_TABLE;
    if (!missingTable) throw e;
  }
  const byKey: Record<string, string> = {};
  for (const r of rows) byKey[r.key as string] = r.value as string;
  return Response.json(byKey);
}
