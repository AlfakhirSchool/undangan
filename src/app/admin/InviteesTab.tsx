"use client";

import { useState } from "react";
import { normName } from "@/lib/text";
import type { Invitee, Reload } from "./types";
import { groupMessage, inviteLink, personalMessage } from "./messages";
import {
  Badge,
  Card,
  Chips,
  Empty,
  ProgressBar,
  btnDanger,
  btnGhost,
  btnPrimary,
  downloadCsv,
  inputClass,
  send,
} from "./ui";

type Filter = "semua" | "belum" | "sudah" | "digital" | "fisik";
type InviteeForm = { name: string; type: "digital" | "fisik"; category: string };

function matchesFilter(inv: Invitee, filter: Filter) {
  if (filter === "belum") return !inv.sent;
  if (filter === "sudah") return inv.sent;
  if (filter === "digital" || filter === "fisik") return inv.type === filter;
  return true;
}

export function InviteesTab({ invitees, reload }: { invitees: Invitee[]; reload: Reload }) {
  const [form, setForm] = useState<InviteeForm>({ name: "", type: "digital", category: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [editing, setEditing] = useState<Invitee | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const nameCount = invitees.reduce<Record<string, number>>((acc, inv) => {
    const key = normName(inv.name);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const duplicates = Object.entries(nameCount)
    .filter(([, n]) => n > 1)
    .map(([key]) => invitees.find((inv) => normName(inv.name) === key)?.name ?? key);
  const formNameTaken = form.name.trim() !== "" && (nameCount[normName(form.name)] ?? 0) > 0;
  const categories = [...new Set(invitees.map((inv) => inv.category))];
  const sentCount = invitees.filter((inv) => inv.sent).length;

  const grouped = invitees
    .filter((inv) => matchesFilter(inv, filter) && normName(inv.name).includes(normName(query)))
    .reduce<Record<string, Invitee[]>>((acc, inv) => {
      (acc[inv.category] ??= []).push(inv);
      return acc;
    }, {});

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await send("POST", "/api/admin/invitees", form);
    setForm({ name: "", type: "digital", category: form.category });
    setNewCategory(false);
    await reload();
  }

  async function saveEdit() {
    if (!editing || !editing.name.trim()) return;
    await send("PATCH", "/api/admin/invitees", editing);
    setEditing(null);
    await reload();
  }

  async function toggleSent(inv: Invitee) {
    await send("PATCH", "/api/admin/invitees", { id: inv.id, sent: !inv.sent });
    await reload();
  }

  async function remove(inv: Invitee) {
    if (!window.confirm(`Hapus ${inv.name} dari daftar undangan?`)) return;
    await send("DELETE", "/api/admin/invitees", { id: inv.id });
    await reload();
  }

  async function copyText(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function share(name: string, group: boolean) {
    const origin = window.location.origin;
    const text = group ? groupMessage(origin, name) : personalMessage(origin, name);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function exportCsv() {
    downloadCsv("daftar-undangan.csv", [
      ["Nama", "Kategori", "Jenis", "Sudah dishare"],
      ...invitees.map((inv) => [inv.name, inv.category, inv.type, inv.sent ? "Ya" : "Belum"]),
    ]);
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light">Undangan dibagikan</p>
            <p className="mt-1 text-3xl font-semibold text-gold">
              {sentCount}
              <span className="text-base font-medium text-foreground/55"> / {invitees.length} tamu</span>
            </p>
          </div>
          <button
            onClick={() => copyText("__group__", groupMessage(window.location.origin))}
            className={btnGhost}
          >
            {copied === "__group__" ? "Tersalin!" : "Salin teks grup"}
          </button>
        </div>
        <ProgressBar value={sentCount} total={invitees.length} />
      </Card>

      {duplicates.length > 0 && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ Nama ganda ({duplicates.length}): {duplicates.join(", ")}
        </div>
      )}

      <Card>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex w-full items-center justify-between text-sm font-semibold"
        >
          <span>＋ Tambah tamu</span>
          <span className="text-foreground/50">{showAdd ? "−" : "+"}</span>
        </button>
        {showAdd && (
          <form onSubmit={add} className="mt-3 grid grid-cols-2 gap-2">
            <input
              placeholder="Nama tamu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`${inputClass} col-span-2`}
            />
            {formNameTaken && (
              <p className="col-span-2 text-xs text-red-700">⚠️ Nama ini sudah ada di daftar.</p>
            )}
            {newCategory ? (
              <input
                autoFocus
                placeholder="Nama kategori baru (mis. Tamu Kuliah)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${inputClass} col-span-2`}
              />
            ) : (
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setNewCategory(true);
                    setForm({ ...form, category: "" });
                  } else {
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                className={`${inputClass} col-span-2`}
              >
                <option value="">Pilih kategori tamu</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__new__">+ Kategori baru…</option>
              </select>
            )}
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as InviteeForm["type"] })}
              className={inputClass}
            >
              <option value="digital">Undangan Digital</option>
              <option value="fisik">Undangan Fisik</option>
            </select>
            <button type="submit" className={btnPrimary}>
              Tambah
            </button>
          </form>
        )}
      </Card>

      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "semua", label: "Semua", count: invitees.length },
          { value: "belum", label: "Belum dishare", count: invitees.length - sentCount },
          { value: "sudah", label: "Sudah dishare", count: sentCount },
          { value: "digital", label: "Digital", count: invitees.filter((i) => i.type === "digital").length },
          { value: "fisik", label: "Fisik", count: invitees.filter((i) => i.type === "fisik").length },
        ]}
      />
      <div className="flex gap-2">
        <input
          type="search"
          placeholder="Cari nama tamu…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
        <button onClick={exportCsv} disabled={invitees.length === 0} className={`${btnGhost} shrink-0`}>
          Unduh CSV
        </button>
      </div>

      {Object.entries(grouped).map(([category, list]) => {
        const isGroup = category.trim().toLowerCase() === "grup";
        return (
          <section key={category} className="space-y-2">
            <h3 className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold-light">
              <span>
                {category} ({list.length})
              </span>
              <span className="font-normal normal-case tracking-normal text-foreground/50">
                {list.filter((i) => i.sent).length} dishare
              </span>
            </h3>
            {list.map((inv) => (
              <Card key={inv.id} className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    <span>{inv.type === "digital" ? "📱" : "📄"}</span>
                    <span className="truncate">{inv.name}</span>
                  </p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {inv.sent && <Badge tone="green">Sudah dishare</Badge>}
                    {(nameCount[normName(inv.name)] ?? 0) > 1 && <Badge tone="red">Ganda</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => toggleSent(inv)}
                    className={`${btnGhost} ${inv.sent ? "border-green-600 bg-green-600 text-white" : ""}`}
                  >
                    {inv.sent ? "✓ Dishare" : "Tandai"}
                  </button>
                  <button
                    onClick={() => setEditing(editing?.id === inv.id ? null : { ...inv })}
                    className={btnGhost}
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() =>
                      copyText(
                        inv.name,
                        isGroup ? `${window.location.origin}/` : inviteLink(window.location.origin, inv.name)
                      )
                    }
                    className={btnGhost}
                  >
                    {copied === inv.name ? "Tersalin!" : "Salin link"}
                  </button>
                  <button
                    onClick={() => share(inv.name, isGroup)}
                    className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    WhatsApp
                  </button>
                  <button onClick={() => remove(inv)} className={`${btnDanger} ml-auto`}>
                    Hapus
                  </button>
                </div>
                {editing?.id === inv.id && (
                  <div className="grid grid-cols-2 gap-2 border-t border-gold/15 pt-3">
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      placeholder="Nama tamu"
                      className={`${inputClass} col-span-2`}
                    />
                    <input
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      placeholder="Kategori"
                      className={inputClass}
                    />
                    <select
                      value={editing.type}
                      onChange={(e) =>
                        setEditing({ ...editing, type: e.target.value as Invitee["type"] })
                      }
                      className={inputClass}
                    >
                      <option value="digital">Undangan Digital</option>
                      <option value="fisik">Undangan Fisik</option>
                    </select>
                    <button onClick={saveEdit} className={`${btnPrimary} col-span-2`}>
                      Simpan perubahan
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </section>
        );
      })}
      {Object.keys(grouped).length === 0 && (
        <Empty>{invitees.length === 0 ? "Belum ada tamu di daftar." : "Tidak ada yang cocok."}</Empty>
      )}
    </div>
  );
}
