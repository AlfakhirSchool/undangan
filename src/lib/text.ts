/** "budi santoso" → "Budi Santoso" (juga setelah "/" dan "-"). */
export function titleCase(s: string) {
  return s.toLowerCase().replace(/(^|\s|\/|-)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

/** Bentuk baku nama untuk membandingkan duplikat: huruf kecil, spasi tunggal. */
export function normName(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
