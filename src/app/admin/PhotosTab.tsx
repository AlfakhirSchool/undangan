"use client";

import { useState } from "react";
import { PHOTO_DEFAULTS, TEXT_DEFAULTS, type PhotoSlot, type TextKey } from "@/lib/site-content";
import type { AdminData, Reload } from "./types";
import { Card, btnGhost, btnPrimary, inputClass, send } from "./ui";

type SlotConfig = {
  slot: PhotoSlot;
  label: string;
  note: string;
  /** Satu foto saja (mengganti foto yang ada), bukan daftar. */
  single?: boolean;
  textKey?: TextKey;
};

const SLOTS: SlotConfig[] = [
  {
    slot: "hero",
    label: "🏠 Foto Utama",
    note: "Foto besar paling atas di undangan, tepat di atas nama pengantin.",
    single: true,
  },
  {
    slot: "break1",
    label: "📷 Foto Jeda 1",
    note: "Foto penuh layar setelah bagian Mempelai.",
    single: true,
    textKey: "break1_caption",
  },
  {
    slot: "break2",
    label: "📷 Foto Jeda 2",
    note: "Foto penuh layar setelah bagian Cerita Kami.",
    single: true,
    textKey: "break2_caption",
  },
  {
    slot: "closing",
    label: "🌙 Foto Penutup",
    note: "Foto hitam-putih di bagian Terima Kasih.",
    single: true,
  },
  {
    slot: "beach",
    label: "🌅 Cover & Latar",
    note: "Foto yang berganti di sampul dan latar belakang. Bila dikosongkan, foto bawaan dipakai.",
  },
  {
    slot: "lamaran",
    label: "💍 Lamaran",
    note: "Carousel di bagian Lamaran. Bila kosong, bagian Lamaran disembunyikan.",
  },
  {
    slot: "gallery1",
    label: "🖼️ Galeri 1",
    note: "Carousel galeri pertama. Bila dikosongkan, foto bawaan dipakai.",
  },
  {
    slot: "gallery2",
    label: "🖼️ Galeri 2",
    note: "Carousel galeri kedua. Bila dikosongkan, foto bawaan dipakai.",
  },
];

/** Foto yang sedang dipakai undangan: isi database, atau foto bawaan bila slot belum pernah diubah. */
function currentPhotos(photos: AdminData["photos"], slot: PhotoSlot) {
  return Object.hasOwn(photos, slot) ? photos[slot] : PHOTO_DEFAULTS[slot];
}

function fileName(url: string) {
  return decodeURIComponent(url.split("/").pop() ?? url);
}

export function PhotosTab({
  photos,
  texts,
  reload,
}: {
  photos: AdminData["photos"];
  texts: AdminData["texts"];
  reload: Reload;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Partial<Record<TextKey, string>>>({});

  /** Slot yang belum pernah diubah menyimpan foto bawaannya dulu, supaya edit tidak menghilangkannya. */
  async function ensureSaved(slot: PhotoSlot) {
    if (Object.hasOwn(photos, slot)) return true;
    return send("PUT", "/api/admin/photos", { slot, urls: PHOTO_DEFAULTS[slot] });
  }

  async function upload(slot: PhotoSlot, index: number, file: File) {
    setBusy(`${slot}-${index}`);
    try {
      if (!(await ensureSaved(slot))) return;
      const fd = new FormData();
      fd.append("slot", slot);
      fd.append("index", String(index));
      fd.append("file", file);
      const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
      if (res.status === 401) window.location.replace("/admin/login");
      else if (!res.ok) window.alert(`Gagal mengunggah foto (kode ${res.status}).`);
    } finally {
      await reload();
      setBusy(null);
    }
  }

  async function remove(slot: PhotoSlot, index: number) {
    if (!window.confirm("Hapus foto ini dari undangan?")) return;
    if (await ensureSaved(slot)) await send("DELETE", "/api/admin/photos", { slot, index });
    await reload();
  }

  async function addDefault(slot: PhotoSlot, url: string) {
    const urls = [...currentPhotos(photos, slot), url];
    await send("PUT", "/api/admin/photos", { slot, urls });
    await reload();
  }

  async function reset(slot: PhotoSlot) {
    if (!window.confirm("Kembalikan slot ini ke foto bawaan? Foto yang sudah diunggah di slot ini akan dilepas.")) return;
    await send("DELETE", "/api/admin/photos", { slot, reset: true });
    await reload();
  }

  async function saveText(key: TextKey) {
    const value = drafts[key];
    if (value === undefined) return;
    if (await send("PUT", "/api/admin/texts", { key, value })) {
      setDrafts((d) => ({ ...d, [key]: undefined }));
    }
    await reload();
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gold/5 text-xs leading-relaxed text-foreground/70">
        Semua foto di undangan diatur di sini. Ketuk foto untuk menggantinya, ✕ untuk menghapus.
        Perubahan langsung tampil di undangan. Foto dari kamera yang sangat besar bisa gagal
        diunggah; kecilkan dulu bila perlu.
      </Card>

      {SLOTS.map(({ slot, label, note, single, textKey }) => {
        const current = currentPhotos(photos, slot);
        const saved = Object.hasOwn(photos, slot);
        const unused = saved ? PHOTO_DEFAULTS[slot].filter((u) => !current.includes(u)) : [];
        const tiles = single ? 1 : current.length + 1;
        const text = textKey ? (drafts[textKey] ?? texts[textKey] ?? TEXT_DEFAULTS[textKey]) : "";
        const textChanged = textKey !== undefined && drafts[textKey] !== undefined;

        return (
          <Card key={slot} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{label}</h2>
                <p className="text-xs text-foreground/55">{note}</p>
              </div>
              {saved && (
                <button onClick={() => reset(slot)} className={`${btnGhost} shrink-0`}>
                  Kembalikan bawaan
                </button>
              )}
            </div>

            <div className={single ? "w-36" : "grid grid-cols-3 gap-3"}>
              {Array.from({ length: tiles }).map((_, i) => {
                const url = current[i];
                const key = `${slot}-${i}`;
                return (
                  <label key={key} className="block cursor-pointer">
                    <div
                      className={`relative mb-1 overflow-hidden rounded-xl ${
                        single ? "aspect-[3/4]" : "aspect-square"
                      } ${
                        url
                          ? "border border-gold/20 bg-gold/5"
                          : "flex items-center justify-center border-2 border-dashed border-gold/40 text-2xl text-gold/60"
                      }`}
                    >
                      {url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element -- foto dari Vercel Blob, ukuran bebas */}
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              remove(slot, i);
                            }}
                            aria-label={`Hapus foto ${i + 1}`}
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        "+"
                      )}
                      {busy === key && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-medium text-gold-light">
                          Mengunggah…
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload(slot, i, file);
                        e.target.value = "";
                      }}
                    />
                    <span className="text-xs text-foreground/60">
                      {url ? (single ? "Ganti foto" : `Ganti foto ${i + 1}`) : "Tambah foto"}
                    </span>
                  </label>
                );
              })}
            </div>

            {unused.length > 0 && (
              <div className="space-y-2 rounded-xl border border-dashed border-gold/30 p-3">
                <p className="text-xs font-medium text-foreground/70">Foto bawaan yang belum dipakai</p>
                {unused.map((url) => (
                  <div key={url} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- foto bawaan lokal */}
                    <img src={url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground/60">{fileName(url)}</span>
                    <button onClick={() => addDefault(slot, url)} className={btnGhost}>
                      Tambahkan
                    </button>
                  </div>
                ))}
              </div>
            )}

            {textKey && (
              <div className="space-y-2 border-t border-gold/15 pt-3">
                <label className="text-xs font-medium text-foreground/70" htmlFor={textKey}>
                  Tulisan di atas foto
                </label>
                <input
                  id={textKey}
                  value={text}
                  maxLength={120}
                  onChange={(e) => setDrafts({ ...drafts, [textKey]: e.target.value })}
                  placeholder={TEXT_DEFAULTS[textKey]}
                  className={`${inputClass} font-script text-xl`}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-foreground/50">Kosongkan untuk menyembunyikan tulisan.</p>
                  <button
                    onClick={() => saveText(textKey)}
                    disabled={!textChanged}
                    className={`${btnPrimary} shrink-0 py-2 text-xs`}
                  >
                    Simpan tulisan
                  </button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
