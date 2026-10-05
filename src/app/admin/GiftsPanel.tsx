"use client";

import { useState } from "react";
import type { Contribution, Reload } from "./types";
import { Badge, Card, Chips, Empty, btnDanger, btnGhost, btnPrimary, inputClass, rupiah, send } from "./ui";

type Filter = "semua" | "belum" | "sudah";

export function GiftsPanel({
  contributions,
  reload,
}: {
  contributions: Contribution[];
  reload: Reload;
}) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [form, setForm] = useState({ name: "", amount: "", item: "", note: "", source: "" });

  const sum = (done: boolean) =>
    contributions.filter((c) => c.done === done).reduce((s, c) => s + (c.amount ?? 0), 0);
  const count = (done: boolean) => contributions.filter((c) => c.done === done).length;
  const sources = [...new Set(contributions.map((c) => c.source).filter(Boolean))];
  const shown = contributions.filter(
    (c) => filter === "semua" || (filter === "sudah") === c.done
  );

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await send("POST", "/api/admin/contributions", {
      name: form.name,
      amount: form.amount ? Number(form.amount) : null,
      item: form.item || null,
      note: form.note || null,
      source: form.source || null,
    });
    setForm({ name: "", amount: "", item: "", note: "", source: "" });
    await reload();
  }

  async function toggleDone(c: Contribution) {
    await send("PATCH", "/api/admin/contributions", { id: c.id, done: !c.done });
    await reload();
  }

  async function remove(c: Contribution) {
    if (!window.confirm(`Hapus catatan dari ${c.name}?`)) return;
    await send("DELETE", "/api/admin/contributions", { id: c.id });
    await reload();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-foreground/60">Belum diterima ({count(false)})</p>
          <p className="mt-1 text-lg font-semibold text-gold">{rupiah(sum(false))}</p>
        </Card>
        <Card>
          <p className="text-xs text-foreground/60">Sudah diterima ({count(true)})</p>
          <p className="mt-1 text-lg font-semibold text-green-700">{rupiah(sum(true))}</p>
        </Card>
      </div>

      <Card>
        <form onSubmit={add} className="grid grid-cols-2 gap-2">
          <p className="col-span-2 text-sm font-semibold">Catat kado / uang</p>
          <input
            placeholder="Nama tamu"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`${inputClass} col-span-2`}
          />
          <input
            placeholder="Uang (Rp)"
            inputMode="numeric"
            value={form.amount ? Number(form.amount).toLocaleString("id-ID") : ""}
            onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/\D/g, "") })}
            className={inputClass}
          />
          <input
            placeholder="Kado (barang)"
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            className={inputClass}
          />
          <input
            list="contribution-sources"
            placeholder="Dari mana (mis. Keluarga, Teman Kantor)"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className={`${inputClass} col-span-2`}
          />
          <datalist id="contribution-sources">
            {sources.map((s) => (
              <option key={s} value={s ?? ""} />
            ))}
          </datalist>
          <input
            placeholder="Catatan"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={`${inputClass} col-span-2`}
          />
          <button type="submit" className={`${btnPrimary} col-span-2`}>
            Tambah
          </button>
        </form>
      </Card>

      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "semua", label: "Semua", count: contributions.length },
          { value: "belum", label: "Belum", count: count(false) },
          { value: "sudah", label: "Sudah", count: count(true) },
        ]}
      />
      <div className="space-y-2">
        {shown.map((c) => (
          <Card
            key={c.id}
            className={`flex items-center justify-between gap-3 p-3 ${c.done ? "opacity-60" : ""}`}
          >
            <div className="min-w-0">
              <p className={`flex items-center gap-2 text-sm font-medium ${c.done ? "line-through" : ""}`}>
                <span>{c.amount ? "💰" : "🎁"}</span>
                <span className="truncate">{c.name}</span>
                {c.source && <Badge tone="gold">{c.source}</Badge>}
              </p>
              <p className="truncate pl-6 text-xs text-foreground/55">
                {[c.amount ? rupiah(c.amount) : "", c.item ?? "", c.note ?? ""].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => toggleDone(c)}
                className={`${btnGhost} ${c.done ? "border-green-600 bg-green-600 text-white" : ""}`}
              >
                {c.done ? "✓ Sudah" : "Sudah"}
              </button>
              <button onClick={() => remove(c)} className={btnDanger}>
                Hapus
              </button>
            </div>
          </Card>
        ))}
        {shown.length === 0 && <Empty>Belum ada catatan.</Empty>}
      </div>
    </div>
  );
}
