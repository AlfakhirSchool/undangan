"use client";

import { useState } from "react";
import type { BudgetItem, Reload } from "./types";
import { Card, Chips, Empty, ProgressBar, btnDanger, btnGhost, btnPrimary, inputClass, rupiah, send } from "./ui";

type Filter = "semua" | "belum" | "sudah";

export function BudgetTab({ items, reload }: { items: BudgetItem[]; reload: Reload }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [form, setForm] = useState({ name: "", cost: "", note: "" });

  const sum = (bought: boolean) =>
    items.filter((b) => b.bought === bought).reduce((s, b) => s + (b.cost ?? 0), 0);
  const count = (bought: boolean) => items.filter((b) => b.bought === bought).length;
  const total = sum(true) + sum(false);
  const shown = items.filter((b) => filter === "semua" || (filter === "sudah") === b.bought);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await send("POST", "/api/admin/budget", {
      name: form.name,
      cost: form.cost ? Number(form.cost) : null,
      note: form.note || null,
    });
    setForm({ name: "", cost: "", note: "" });
    await reload();
  }

  async function toggleBought(b: BudgetItem) {
    await send("PATCH", "/api/admin/budget", { id: b.id, bought: !b.bought });
    await reload();
  }

  async function remove(b: BudgetItem) {
    if (!window.confirm(`Hapus “${b.name}” dari budget?`)) return;
    await send("DELETE", "/api/admin/budget", { id: b.id });
    await reload();
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 bg-linear-to-br from-[#fff4ea] to-white">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light">Total budget</p>
          <p className="mt-1 text-3xl font-semibold text-gold">{rupiah(total)}</p>
        </div>
        <ProgressBar value={sum(true)} total={total} />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-foreground/60">Sudah dibeli ({count(true)})</p>
            <p className="font-semibold text-green-700">{rupiah(sum(true))}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60">Belum dibeli ({count(false)})</p>
            <p className="font-semibold text-gold">{rupiah(sum(false))}</p>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={add} className="grid grid-cols-2 gap-2">
          <p className="col-span-2 text-sm font-semibold">Tambah kebutuhan</p>
          <input
            placeholder="Nama (mis. Katering, Dekorasi)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`${inputClass} col-span-2`}
          />
          <input
            placeholder="Biaya (Rp)"
            inputMode="numeric"
            value={form.cost ? Number(form.cost).toLocaleString("id-ID") : ""}
            onChange={(e) => setForm({ ...form, cost: e.target.value.replace(/\D/g, "") })}
            className={inputClass}
          />
          <input
            placeholder="Catatan"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={inputClass}
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
          { value: "semua", label: "Semua", count: items.length },
          { value: "belum", label: "Belum dibeli", count: count(false) },
          { value: "sudah", label: "Sudah dibeli", count: count(true) },
        ]}
      />
      <div className="space-y-2">
        {shown.map((b) => (
          <Card
            key={b.id}
            className={`flex items-center justify-between gap-3 p-3 ${b.bought ? "opacity-60" : ""}`}
          >
            <div className="min-w-0">
              <p className={`flex items-center gap-2 text-sm font-medium ${b.bought ? "line-through" : ""}`}>
                <span>{b.bought ? "✅" : "🛒"}</span>
                <span className="truncate">{b.name}</span>
              </p>
              <p className="truncate pl-6 text-xs text-foreground/55">
                {[b.cost ? rupiah(b.cost) : "", b.note ?? ""].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => toggleBought(b)}
                className={`${btnGhost} ${b.bought ? "border-green-600 bg-green-600 text-white" : ""}`}
              >
                {b.bought ? "✓ Dibeli" : "Dibeli"}
              </button>
              <button onClick={() => remove(b)} className={btnDanger}>
                Hapus
              </button>
            </div>
          </Card>
        ))}
        {shown.length === 0 && <Empty>Belum ada daftar kebutuhan.</Empty>}
      </div>
    </div>
  );
}
