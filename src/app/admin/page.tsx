"use client";

import { useCallback, useEffect, useState } from "react";
import { events } from "../data";
import type { AdminData } from "./types";
import { BudgetTab } from "./BudgetTab";
import { GuestsTab, type GuestsSub } from "./GuestsTab";
import { InviteesTab } from "./InviteesTab";
import { type AdminTab, OverviewTab } from "./OverviewTab";
import { PhotosTab } from "./PhotosTab";

const TABS: { value: AdminTab; icon: string; label: string }[] = [
  { value: "ringkasan", icon: "📊", label: "Ringkasan" },
  { value: "tamu", icon: "👥", label: "Tamu" },
  { value: "undangan", icon: "📋", label: "Undangan" },
  { value: "foto", icon: "🖼️", label: "Foto" },
  { value: "budget", icon: "💰", label: "Budget" },
];

/** Ambil semua data dashboard sekaligus. Sesi habis → kembali ke halaman login. */
async function loadAll(): Promise<AdminData | null> {
  const [guests, invitees, budget, photos, texts] = await Promise.all(
    [
      "/api/admin/guests",
      "/api/admin/invitees",
      "/api/admin/budget",
      "/api/photos",
      "/api/texts",
    ].map((url) => fetch(url))
  );
  if (guests.status === 401) {
    window.location.replace("/admin/login");
    return null;
  }
  const g = await guests.json();
  return {
    wishes: g.wishes,
    rsvps: g.rsvps,
    contributions: g.contributions,
    invitees: await invitees.json(),
    budget: await budget.json(),
    photos: await photos.json(),
    texts: await texts.json(),
  };
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("ringkasan");
  const [guestsSub, setGuestsSub] = useState<GuestsSub>("rsvp");
  const [data, setData] = useState<AdminData | null>(null);

  const reload = useCallback(async () => {
    const next = await loadAll();
    if (next) setData(next);
  }, []);

  useEffect(() => {
    loadAll().then((next) => next && setData(next));
  }, []);

  function navigate(next: AdminTab, sub?: GuestsSub) {
    setTab(next);
    if (sub) setGuestsSub(sub);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.replace("/admin/login");
  }

  const unreplied = data?.wishes.filter((w) => !w.reply).length ?? 0;

  return (
    <main className="admin-ui mx-auto min-h-dvh w-full max-w-2xl bg-[#f8f1e7] pb-16">
      <header className="bg-linear-to-br from-[#c8703c] via-gold to-[#6f3419] px-5 pt-6 pb-8 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/75">Dashboard Undangan</p>
            <h1 className="mt-1 text-2xl font-semibold">Feri &amp; Ayu 💍</h1>
            <p className="mt-0.5 text-sm text-white/80">{events[0].date}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/50 px-3 py-1.5 text-xs font-medium"
            >
              Undangan ↗
            </a>
            <button
              onClick={logout}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-20 -mt-4 px-4">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-gold/15 bg-white/95 p-1.5 shadow-md backdrop-blur">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => navigate(t.value)}
              className={`relative flex min-w-0 flex-1 flex-col items-center rounded-xl px-1 py-2 text-[11px] font-medium ${
                tab === t.value ? "bg-gold text-white shadow" : "text-gold-light"
              }`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              <span className="mt-1">{t.label}</span>
              {t.value === "tamu" && unreplied > 0 && (
                <span className="absolute top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {unreplied}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="px-4 pt-5">
        {!data ? (
          <p className="py-16 text-center text-sm text-foreground/55">Memuat data…</p>
        ) : (
          <>
            {tab === "ringkasan" && <OverviewTab data={data} onNavigate={navigate} />}
            {tab === "tamu" && (
              <GuestsTab data={data} reload={reload} sub={guestsSub} onSub={setGuestsSub} />
            )}
            {tab === "undangan" && <InviteesTab invitees={data.invitees} reload={reload} />}
            {tab === "foto" && <PhotosTab photos={data.photos} texts={data.texts} reload={reload} />}
            {tab === "budget" && <BudgetTab items={data.budget} reload={reload} />}
          </>
        )}
      </div>
    </main>
  );
}
