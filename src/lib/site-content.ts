/**
 * Foto bawaan tiap slot. Dipakai undangan sebelum slot itu pernah diubah dari dashboard
 * admin; sesudahnya isi database yang berlaku.
 */
export const PHOTO_DEFAULTS = {
  hero: ["/images/hero.jpg"],
  break1: ["/images/gallery4.jpg"],
  break2: ["/images/gallery2.jpg"],
  closing: ["/images/gallery1.jpg"],
  beach: ["/images/bg-beach.jpg", "/images/bg1.jpg", "/images/bg2.jpg", "/images/bg3.jpg"],
  lamaran: ["/images/lamaran.jpg"],
  gallery1: ["/images/gallery1.jpg", "/images/gallery2.jpg", "/images/gallery3.jpg"],
  gallery2: ["/images/gallery4.jpg", "/images/gallery5.jpg", "/images/gallery6.jpg"],
};

export type PhotoSlot = keyof typeof PHOTO_DEFAULTS;

/** Teks keterangan di foto jeda; bisa diubah dari dashboard admin. */
export const TEXT_DEFAULTS = {
  break1_caption: "Dua hati, satu tujuan",
  break2_caption: "Bersama, selamanya",
};

export type TextKey = keyof typeof TEXT_DEFAULTS;

export function isPhotoSlot(value: unknown): value is PhotoSlot {
  return typeof value === "string" && Object.hasOwn(PHOTO_DEFAULTS, value);
}

export function isTextKey(value: unknown): value is TextKey {
  return typeof value === "string" && Object.hasOwn(TEXT_DEFAULTS, value);
}
