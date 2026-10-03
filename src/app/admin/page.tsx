"use client";

import { useEffect, useState } from "react";

type Wish = { id: number; name: string; message: string; created_at: string };
type Rsvp = { id: number; name: string; attend: string; guests: number; created_at: string };
type Contribution = {
  id: number;
  name: string;
  amount: number | null;
  item: string | null;
  note: string | null;
  source: string | null;
  done: boolean;
  created_at: string;
};
type Invitee = { id: number; name: string; type: "digital" | "fisik"; category: string };
type BudgetItem = {
  id: number;
  name: string;
  cost: number | null;
  bought: boolean;
  note: string | null;
};

const PHOTO_SLOTS: { slot: string; label: string; count: number }[] = [
  { slot: "beach", label: "🌅 Cover / Background", count: 4 },
  { slot: "lamaran", label: "💍 Lamaran", count: 5 },
  { slot: "gallery1", label: "🖼️ Galeri 1", count: 3 },
  { slot: "gallery2", label: "🖼️ Galeri 2", count: 3 },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"tamu" | "undangan" | "foto" | "budget">("budget");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({ name: "", amount: "", item: "", note: "", source: "" });
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inviteeForm, setInviteeForm] = useState<{
    name: string;
    type: "digital" | "fisik";
    category: string;
  }>({
    name: "",
    type: "digital",
    category: "",
  });
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState(false);
  const [tamuSub, setTamuSub] = useState<"rsvp" | "ucapan" | "kado">("rsvp");
  const [menuOpen, setMenuOpen] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetForm, setBudgetForm] = useState({ name: "", cost: "", note: "" });

  function loadGuests() {
    fetch("/api/admin/guests")
      .then((r) => r.json())
      .then((d) => {
        setWishes(d.wishes);
        setRsvps(d.rsvps);
        setContributions(d.contributions);
      });
  }

  function loadPhotos() {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(setPhotos);
  }

  function loadInvitees() {
    fetch("/api/admin/invitees")
      .then((r) => r.json())
      .then(setInvitees);
  }

  function loadBudget() {
    fetch("/api/admin/budget")
      .then((r) => r.json())
      .then(setBudgetItems);
  }

  async function addBudgetItem(e: React.FormEvent) {
    e.preventDefault();
    if (!budgetForm.name.trim()) return;
    await fetch("/api/admin/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: budgetForm.name,
        cost: budgetForm.cost ? Number(budgetForm.cost) : null,
        note: budgetForm.note || null,
      }),
    });
    setBudgetForm({ name: "", cost: "", note: "" });
    loadBudget();
  }

  async function toggleBought(id: number, bought: boolean) {
    await fetch("/api/admin/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, bought }),
    });
    loadBudget();
  }

  async function deleteBudgetItem(id: number) {
    await fetch("/api/admin/budget", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadBudget();
  }

  useEffect(() => {
    loadGuests();
    loadPhotos();
    loadInvitees();
    loadBudget();
  }, []);

  async function addInvitee(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteeForm.name.trim()) return;
    await fetch("/api/admin/invitees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteeForm),
    });
    setInviteeForm({ name: "", type: "digital", category: inviteeForm.category });
    setNewCategory(false);
    loadInvitees();
  }

  async function deleteInvitee(id: number) {
    await fetch("/api/admin/invitees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadInvitees();
  }

  function inviteLink(name: string) {
    return `${window.location.origin}/?${new URLSearchParams({ to: name }).toString()}`;
  }

  function titleCase(s: string) {
    return s.toLowerCase().replace(/(^|\s|\/|-)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
  }

  function groupMessage(groupName = "anggota grup") {
    return `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\nKepada Yth.\nBapak/Ibu/Saudara/i ${titleCase(groupName)}\n\nTanpa mengurangi rasa hormat, dengan memohon ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i sekalian untuk menghadiri acara pernikahan kami:\n\nFeriman & Ayu Natasya\n\nWaktu, tempat, dan informasi lengkap acara dapat dilihat melalui undangan digital berikut:\n${window.location.origin}/\n\nMerupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i sekalian berkenan hadir dan memberikan doa restu.\n\nMohon maaf apabila ada kekeliruan dalam penulisan. Terima kasih atas perhatian dan kehadirannya.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh\n\nHormat kami,\nFeriman & Ayu Natasya`;
  }

  function shareInvite(name: string, group = false) {
    const text = group
      ? groupMessage(name)
      : `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\nKepada Yth.\nBapak/Ibu/Saudara/i\n${titleCase(name)}\n\nTanpa mengurangi rasa hormat, dengan memohon ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\nFeriman & Ayu Natasya\n\nWaktu, tempat, dan informasi lengkap acara dapat dilihat melalui undangan digital berikut:\n${inviteLink(name)}\n\nMerupakan kebahagiaan bagi kami apabila berkenan hadir dan memberikan doa restu. Kehadiran Anda akan melengkapi hari bahagia kami.\n\nMohon maaf apabila ada kekeliruan dalam penulisan nama atau gelar. Terima kasih atas perhatian dan kehadirannya.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh\n\nHormat kami,\nFeriman & Ayu Natasya`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function copyInviteLink(name: string, group = false) {
    await navigator.clipboard.writeText(group ? `${window.location.origin}/` : inviteLink(name));
    setCopiedFor(name);
    setTimeout(() => setCopiedFor(null), 1500);
  }

  async function copyGroupText() {
    await navigator.clipboard.writeText(groupMessage());
    setCopiedFor("__group__");
    setTimeout(() => setCopiedFor(null), 1500);
  }

  async function addContribution(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await fetch("/api/admin/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        amount: form.amount ? Number(form.amount) : null,
        item: form.item || null,
        note: form.note || null,
        source: form.source || null,
      }),
    });
    setForm({ name: "", amount: "", item: "", note: "", source: "" });
    loadGuests();
  }

  async function deleteWish(id: number) {
    await fetch("/api/wishes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadGuests();
  }

  async function deleteRsvp(id: number) {
    await fetch("/api/rsvp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadGuests();
  }

  async function deleteContribution(id: number) {
    await fetch("/api/admin/contributions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadGuests();
  }

  async function toggleDone(id: number, done: boolean) {
    await fetch("/api/admin/contributions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
    loadGuests();
  }

  async function uploadPhoto(slot: string, index: number, file: File) {
    const fd = new FormData();
    fd.append("slot", slot);
    fd.append("index", String(index));
    fd.append("file", file);
    await fetch("/api/admin/photos", { method: "POST", body: fd });
    loadPhotos();
  }

  async function deletePhoto(slot: string, index: number) {
    await fetch("/api/admin/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, index }),
    });
    loadPhotos();
  }

  const totalBelum = contributions
    .filter((c) => !c.done)
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);
  const totalSudah = contributions
    .filter((c) => c.done)
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);
  const countBelum = contributions.filter((c) => !c.done).length;
  const countSudah = contributions.filter((c) => c.done).length;

  return (
    <main className="min-h-dvh bg-background px-5 py-6 pb-16 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Buka menu"
          className="text-2xl leading-none px-2"
        >
          ☰
        </button>
        <h1 className="text-xl font-semibold">💍 Admin Dashboard</h1>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-background shadow-xl p-4 flex flex-col gap-2 transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup menu"
            className="self-end text-xl leading-none px-2 mb-2"
          >
            ✕
          </button>
          <button
            onClick={() => setTab("tamu")}
            className={`text-left px-4 py-2 rounded-md text-sm ${tab === "tamu" ? "bg-black text-white" : "border"}`}
          >
            👤 Tamu
          </button>
          {tab === "tamu" && (
            <div className="flex flex-col gap-1 pl-4">
              <button
                onClick={() => {
                  setTamuSub("kado");
                  setMenuOpen(false);
                }}
                className={`text-left px-3 py-1.5 rounded-md text-xs ${tamuSub === "kado" ? "bg-black text-white" : "border"}`}
              >
                🎁 Kado & Uang
              </button>
              <button
                onClick={() => {
                  setTamuSub("rsvp");
                  setMenuOpen(false);
                }}
                className={`text-left px-3 py-1.5 rounded-md text-xs ${tamuSub === "rsvp" ? "bg-black text-white" : "border"}`}
              >
                ✅ RSVP ({rsvps.length})
              </button>
              <button
                onClick={() => {
                  setTamuSub("ucapan");
                  setMenuOpen(false);
                }}
                className={`text-left px-3 py-1.5 rounded-md text-xs ${tamuSub === "ucapan" ? "bg-black text-white" : "border"}`}
              >
                💌 Doa & Ucapan ({wishes.length})
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setTab("undangan");
              setMenuOpen(false);
            }}
            className={`text-left px-4 py-2 rounded-md text-sm ${tab === "undangan" ? "bg-black text-white" : "border"}`}
          >
            📋 Daftar Undangan
          </button>
          <button
            onClick={() => {
              setTab("foto");
              setMenuOpen(false);
            }}
            className={`text-left px-4 py-2 rounded-md text-sm ${tab === "foto" ? "bg-black text-white" : "border"}`}
          >
            🖼️ Foto
          </button>
          <button
            onClick={() => {
              setTab("budget");
              setMenuOpen(false);
            }}
            className={`text-left px-4 py-2 rounded-md text-sm ${tab === "budget" ? "bg-black text-white" : "border"}`}
          >
            💰 Budget
          </button>
        </div>
      </div>

      {tab === "tamu" && (
        <div>
          {tamuSub === "rsvp" && (
            <section>
              <h2 className="font-semibold mb-2">✅ RSVP ({rsvps.length})</h2>
              <div className="space-y-2">
                {rsvps.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span>{r.attend === "Hadir" ? "✅" : "❌"}</span>
                      <span className="truncate">{r.name}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="opacity-70 text-xs">
                        {r.attend}
                        {r.attend === "Hadir" ? ` (${r.guests})` : ""}
                      </span>
                      <button
                        onClick={() => deleteRsvp(r.id)}
                        className="text-red-600 text-xs"
                      >
                        Hapus
                      </button>
                    </span>
                  </div>
                ))}
                {rsvps.length === 0 && <p className="opacity-60">Belum ada RSVP.</p>}
              </div>
            </section>
          )}

          {tamuSub === "ucapan" && (
            <section>
              <h2 className="font-semibold mb-2">💌 Doa & Ucapan ({wishes.length})</h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="flex justify-between items-start gap-2 border rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{w.name}</p>
                      <p className="opacity-70 text-xs">{w.message}</p>
                    </div>
                    <button
                      onClick={() => deleteWish(w.id)}
                      className="text-red-600 text-xs shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                {wishes.length === 0 && <p className="opacity-60">Belum ada ucapan.</p>}
              </div>
            </section>
          )}

          {tamuSub === "kado" && (
            <section>
              <h2 className="font-semibold mb-2">🎁 Kado & Uang</h2>
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="border rounded-lg px-3 py-2">
                  <p className="opacity-60 text-xs">Belum ({countBelum})</p>
                  <p className="font-semibold">Rp{totalBelum.toLocaleString("id-ID")}</p>
                </div>
                <div className="border rounded-lg px-3 py-2">
                  <p className="opacity-60 text-xs">Sudah ({countSudah})</p>
                  <p className="font-semibold">Rp{totalSudah.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <form onSubmit={addContribution} className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <input
                  placeholder="Nama tamu"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded-md px-3 py-2 col-span-2"
                />
                <input
                  placeholder="Jumlah uang (Rp)"
                  inputMode="numeric"
                  value={form.amount ? Number(form.amount).toLocaleString("id-ID") : ""}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value.replace(/\D/g, "") })
                  }
                  className="border rounded-md px-3 py-2"
                />
                <input
                  placeholder="Kado (barang)"
                  value={form.item}
                  onChange={(e) => setForm({ ...form, item: e.target.value })}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  placeholder="Catatan"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="border rounded-md px-3 py-2 col-span-2"
                />
                <input
                  list="contribution-sources"
                  placeholder="Dari mana (mis. Keluarga, Teman Kantor)"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="border rounded-md px-3 py-2 col-span-2"
                />
                <datalist id="contribution-sources">
                  {[...new Set(contributions.map((c) => c.source).filter(Boolean))].map((s) => (
                    <option key={s} value={s ?? ""} />
                  ))}
                </datalist>
                <button
                  type="submit"
                  className="col-span-2 bg-black text-white rounded-full px-4 py-2"
                >
                  Tambah
                </button>
              </form>
              <div className="space-y-2">
                {contributions.map((c) => (
                  <div
                    key={c.id}
                    className={`flex justify-between items-center gap-2 border rounded-lg px-3 py-2 text-sm ${
                      c.done ? "opacity-50" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`font-medium flex items-center gap-2 truncate ${
                          c.done ? "line-through" : ""
                        }`}
                      >
                        <span>{c.amount ? "💰" : "🎁"}</span>
                        {c.name}
                        {c.source && (
                          <span className="text-[10px] font-normal opacity-60 border rounded-full px-2 py-0.5">
                            {c.source}
                          </span>
                        )}
                      </p>
                      <p className="opacity-60 text-xs pl-6 truncate">
                        {c.amount ? `Rp${c.amount.toLocaleString("id-ID")}` : ""}
                        {c.item ? ` · ${c.item}` : ""}
                        {c.note ? ` · ${c.note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleDone(c.id, !c.done)}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          c.done ? "bg-black text-white" : ""
                        }`}
                      >
                        {c.done ? "✓ Sudah" : "Sudah"}
                      </button>
                      <button
                        onClick={() => deleteContribution(c.id)}
                        className="text-red-600 text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
                {contributions.length === 0 && <p className="opacity-60">Belum ada catatan.</p>}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "undangan" && (
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold mb-2">
              📋 Daftar Tamu Diundang ({invitees.length})
            </h2>
            <button
              onClick={copyGroupText}
              className="mb-4 text-xs px-3 py-1.5 rounded-full border"
            >
              {copiedFor === "__group__" ? "Tersalin!" : "Salin Teks Grup"}
            </button>
            <form onSubmit={addInvitee} className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <input
                placeholder="Nama tamu"
                value={inviteeForm.name}
                onChange={(e) => setInviteeForm({ ...inviteeForm, name: e.target.value })}
                className="border rounded-md px-3 py-2 col-span-2"
              />
              {newCategory ? (
                <input
                  autoFocus
                  placeholder="Nama kategori baru (mis. Tamu Kuliah)"
                  value={inviteeForm.category}
                  onChange={(e) => setInviteeForm({ ...inviteeForm, category: e.target.value })}
                  className="border rounded-md px-3 py-2 col-span-2"
                />
              ) : (
                <select
                  value={inviteeForm.category}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setNewCategory(true);
                      setInviteeForm({ ...inviteeForm, category: "" });
                    } else {
                      setInviteeForm({ ...inviteeForm, category: e.target.value });
                    }
                  }}
                  className="border rounded-md px-3 py-2 col-span-2"
                >
                  <option value="">Pilih kategori tamu</option>
                  {[...new Set(invitees.map((inv) => inv.category))].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__new__">+ Kategori baru...</option>
                </select>
              )}
              <select
                value={inviteeForm.type}
                onChange={(e) =>
                  setInviteeForm({
                    ...inviteeForm,
                    type: e.target.value as "digital" | "fisik",
                  })
                }
                className="border rounded-md px-3 py-2"
              >
                <option value="digital">Undangan Digital</option>
                <option value="fisik">Undangan Fisik</option>
              </select>
              <button type="submit" className="bg-black text-white rounded-full px-4 py-2">
                Tambah
              </button>
            </form>
            {Object.entries(
              invitees.reduce<Record<string, Invitee[]>>((acc, inv) => {
                (acc[inv.category] ??= []).push(inv);
                return acc;
              }, {}),
            ).map(([category, list]) => {
              const isGroup = category.trim().toLowerCase() === "grup";
              return (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-semibold uppercase opacity-60 mb-2">
                  {category} ({list.length})
                </h3>
                <div className="space-y-2">
                  {list.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium flex items-center gap-2 truncate">
                          <span>{inv.type === "digital" ? "📱" : "📄"}</span>
                          {inv.name}
                        </p>
                        <p className="opacity-60 text-xs pl-6">
                          {inv.type === "digital" ? "Digital" : "Fisik"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => copyInviteLink(inv.name, isGroup)}
                          className="text-xs px-2 py-1 rounded-full border"
                        >
                          {copiedFor === inv.name ? "Tersalin!" : "Copy"}
                        </button>
                        <button
                          onClick={() => shareInvite(inv.name, isGroup)}
                          className="text-xs px-2 py-1 rounded-full bg-green-600 text-white"
                        >
                          WA
                        </button>
                        <button
                          onClick={() => deleteInvitee(inv.id)}
                          className="text-red-600 text-xs px-1"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
            {invitees.length === 0 && <p className="opacity-60">Belum ada tamu di daftar.</p>}
          </section>
        </div>
      )}

      {tab === "foto" && (
        <div className="space-y-10">
          {PHOTO_SLOTS.map(({ slot, label, count }) => {
            const tileCount = Math.max(count, photos[slot]?.length ?? 0);
            return (
              <section key={slot}>
                <h2 className="font-semibold mb-3">{label}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: tileCount }).map((_, i) => {
                    const url = photos[slot]?.[i];
                    return (
                      <label key={i} className="block cursor-pointer">
                        <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden mb-1 border">
                          {url && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deletePhoto(slot, i);
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadPhoto(slot, i, file);
                          }}
                        />
                        <span className="text-xs opacity-70">Ganti foto {i + 1}</span>
                      </label>
                    );
                  })}
                  <label className="block cursor-pointer">
                    <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-2xl opacity-50 mb-1">
                      +
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(slot, tileCount, file);
                      }}
                    />
                    <span className="text-xs opacity-70">Tambah foto</span>
                  </label>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === "budget" && (
        <section>
          <h2 className="font-semibold mb-2">💰 Budget Pernikahan</h2>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="border rounded-lg px-3 py-2">
              <p className="opacity-60 text-xs">
                Belum dibeli ({budgetItems.filter((b) => !b.bought).length})
              </p>
              <p className="font-semibold">
                Rp
                {budgetItems
                  .filter((b) => !b.bought)
                  .reduce((sum, b) => sum + (b.cost ?? 0), 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
            <div className="border rounded-lg px-3 py-2">
              <p className="opacity-60 text-xs">
                Sudah dibeli ({budgetItems.filter((b) => b.bought).length})
              </p>
              <p className="font-semibold">
                Rp
                {budgetItems
                  .filter((b) => b.bought)
                  .reduce((sum, b) => sum + (b.cost ?? 0), 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <form onSubmit={addBudgetItem} className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <input
              placeholder="Nama kebutuhan (mis. Katering, Dekorasi)"
              value={budgetForm.name}
              onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
              className="border rounded-md px-3 py-2 col-span-2"
            />
            <input
              placeholder="Biaya (Rp)"
              inputMode="numeric"
              value={budgetForm.cost ? Number(budgetForm.cost).toLocaleString("id-ID") : ""}
              onChange={(e) =>
                setBudgetForm({ ...budgetForm, cost: e.target.value.replace(/\D/g, "") })
              }
              className="border rounded-md px-3 py-2 col-span-2"
            />
            <input
              placeholder="Catatan"
              value={budgetForm.note}
              onChange={(e) => setBudgetForm({ ...budgetForm, note: e.target.value })}
              className="border rounded-md px-3 py-2 col-span-2"
            />
            <button
              type="submit"
              className="col-span-2 bg-black text-white rounded-full px-4 py-2"
            >
              Tambah
            </button>
          </form>
          <div className="space-y-2">
            {budgetItems.map((b) => (
              <div
                key={b.id}
                className={`flex justify-between items-center gap-2 border rounded-lg px-3 py-2 text-sm ${
                  b.bought ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`font-medium flex items-center gap-2 truncate ${
                      b.bought ? "line-through" : ""
                    }`}
                  >
                    <span>{b.bought ? "✅" : "🛒"}</span>
                    {b.name}
                  </p>
                  <p className="opacity-60 text-xs pl-6 truncate">
                    {b.cost ? `Rp${b.cost.toLocaleString("id-ID")}` : ""}
                    {b.note ? ` · ${b.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleBought(b.id, !b.bought)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      b.bought ? "bg-black text-white" : ""
                    }`}
                  >
                    {b.bought ? "✓ Dibeli" : "Dibeli"}
                  </button>
                  <button
                    onClick={() => deleteBudgetItem(b.id)}
                    className="text-red-600 text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {budgetItems.length === 0 && (
              <p className="opacity-60">Belum ada daftar kebutuhan.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
