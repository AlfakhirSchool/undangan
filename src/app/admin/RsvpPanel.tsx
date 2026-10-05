"use client";

import { useState } from "react";
import { normName } from "@/lib/text";
import type { Reload, Rsvp } from "./types";
import { Badge, Card, Chips, Empty, btnDanger, btnGhost, downloadCsv, inputClass, send, timeAgo } from "./ui";

type Filter = "semua" | "Hadir" | "Tidak Hadir";

export function RsvpPanel({ rsvps, reload }: { rsvps: Rsvp[]; reload: Reload }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [query, setQuery] = useState("");

  const attending = rsvps.filter((r) => r.attend === "Hadir");
  const people = attending.reduce((sum, r) => sum + r.guests, 0);
  const declined = rsvps.length - attending.length;
  const nameCount = rsvps.reduce<Record<string, number>>((acc, r) => {
    const key = normName(r.name);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const shown = rsvps.filter(
    (r) =>
      (filter === "semua" || r.attend === filter) && normName(r.name).includes(normName(query))
  );

  async function remove(r: Rsvp) {
    if (!window.confirm(`Hapus RSVP dari ${r.name}?`)) return;
    await send("DELETE", "/api/admin/rsvp", { id: r.id });
    await reload();
  }

  function exportCsv() {
    downloadCsv("rsvp-feri-ayu.csv", [
      ["Nama", "Kehadiran", "Jumlah Tamu", "Waktu"],
      ...rsvps.map((r) => [
        r.name,
        r.attend,
        r.attend === "Hadir" ? String(r.guests) : "0",
        new Date(r.created_at).toLocaleString("id-ID"),
      ]),
    ]);
  }

  return (
    <div className="space-y-4">
      <Card className="bg-linear-to-br from-[#fff4ea] to-white">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light">Perkiraan tamu hadir</p>
        <p className="mt-1 text-4xl font-semibold text-gold">
          {people} <span className="text-base font-medium text-foreground/60">orang</span>
        </p>
        <p className="mt-1 text-xs text-foreground/60">
          dari {attending.length} konfirmasi hadir · {declined} tidak hadir · total {rsvps.length} konfirmasi
        </p>
      </Card>

      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "semua", label: "Semua", count: rsvps.length },
          { value: "Hadir", label: "Hadir", count: attending.length },
          { value: "Tidak Hadir", label: "Tidak hadir", count: declined },
        ]}
      />
      <div className="flex gap-2">
        <input
          type="search"
          placeholder="Cari nama…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
        <button onClick={exportCsv} disabled={rsvps.length === 0} className={`${btnGhost} shrink-0`}>
          Unduh CSV
        </button>
      </div>

      <div className="space-y-2">
        {shown.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">{r.name}</span>
                {(nameCount[normName(r.name)] ?? 0) > 1 && <Badge tone="red">Ganda</Badge>}
              </p>
              <p className="text-xs text-foreground/55">{timeAgo(r.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge tone={r.attend === "Hadir" ? "green" : "gray"}>
                {r.attend === "Hadir" ? `Hadir · ${r.guests}` : "Tidak hadir"}
              </Badge>
              <button onClick={() => remove(r)} className={btnDanger}>
                Hapus
              </button>
            </div>
          </Card>
        ))}
        {shown.length === 0 && (
          <Empty>{rsvps.length === 0 ? "Belum ada RSVP." : "Tidak ada yang cocok."}</Empty>
        )}
      </div>
    </div>
  );
}
