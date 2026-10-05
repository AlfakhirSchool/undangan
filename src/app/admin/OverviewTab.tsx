"use client";

import { useState } from "react";
import { events, weddingDateISO } from "../data";
import { normName } from "@/lib/text";
import type { AdminData } from "./types";
import type { GuestsSub } from "./GuestsTab";
import { Card, ProgressBar, btnGhost, rupiah, timeAgo } from "./ui";

export type AdminTab = "ringkasan" | "tamu" | "undangan" | "foto" | "budget";

function StatCard({
  icon,
  label,
  value,
  hint,
  onClick,
  children,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  hint?: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="h-full space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground/60">
          <span>{icon}</span>
          {label}
        </p>
        <p className="text-2xl font-semibold text-gold">{value}</p>
        {hint && <p className="text-xs text-foreground/55">{hint}</p>}
        {children}
      </Card>
    </button>
  );
}

export function OverviewTab({
  data,
  onNavigate,
}: {
  data: AdminData;
  onNavigate: (tab: AdminTab, sub?: GuestsSub) => void;
}) {
  const [copied, setCopied] = useState(false);
  // Waktu dibaca sekali saat tab dibuka (bukan tiap render) supaya render tetap murni.
  const [now] = useState(() => Date.now());
  const { wishes, rsvps, contributions, invitees, budget } = data;

  const daysLeft = Math.max(0, Math.ceil((new Date(weddingDateISO).getTime() - now) / 86_400_000));
  const attending = rsvps.filter((r) => r.attend === "Hadir");
  const people = attending.reduce((sum, r) => sum + r.guests, 0);
  const sent = invitees.filter((i) => i.sent).length;
  const unreplied = wishes.filter((w) => !w.reply).length;
  const giftSum = (done: boolean) =>
    contributions.filter((c) => c.done === done).reduce((s, c) => s + (c.amount ?? 0), 0);
  const budgetSum = (bought: boolean) =>
    budget.filter((b) => b.bought === bought).reduce((s, b) => s + (b.cost ?? 0), 0);
  const budgetTotal = budgetSum(true) + budgetSum(false);

  const countNames = (names: string[]) =>
    Object.values(
      names.reduce<Record<string, number>>((acc, n) => {
        const key = normName(n);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})
    ).filter((n) => n > 1).length;
  const dupInvitees = countNames(invitees.map((i) => i.name));
  const dupRsvps = countNames(rsvps.map((r) => r.name));

  const attention = [
    unreplied > 0 && {
      text: `${unreplied} ucapan belum dibalas`,
      go: () => onNavigate("tamu", "ucapan"),
    },
    invitees.length - sent > 0 && {
      text: `${invitees.length - sent} tamu belum ditandai sudah dishare`,
      go: () => onNavigate("undangan"),
    },
    dupInvitees > 0 && {
      text: `${dupInvitees} nama ganda di daftar undangan`,
      go: () => onNavigate("undangan"),
    },
    dupRsvps > 0 && {
      text: `${dupRsvps} nama mengisi RSVP lebih dari sekali`,
      go: () => onNavigate("tamu", "rsvp"),
    },
  ].filter((item) => item !== false);

  const activity = [
    ...rsvps.map((r) => ({
      key: `r${r.id}`,
      at: r.created_at,
      icon: r.attend === "Hadir" ? "✅" : "❌",
      title: r.name,
      text: r.attend === "Hadir" ? `konfirmasi hadir (${r.guests} orang)` : "tidak bisa hadir",
    })),
    ...wishes.map((w) => ({
      key: `w${w.id}`,
      at: w.created_at,
      icon: "💌",
      title: w.name,
      text: w.message,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-5">
      <Card className="flex items-center justify-between gap-3 bg-linear-to-br from-[#fff4ea] to-white">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light">Menuju hari bahagia</p>
          <p className="mt-1 text-4xl font-semibold text-gold">
            {daysLeft} <span className="text-base font-medium text-foreground/60">hari lagi</span>
          </p>
          <p className="mt-1 text-xs text-foreground/60">{events[0].date}</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className={`${btnGhost} text-center`}>
            Lihat undangan ↗
          </a>
          <button onClick={copyLink} className={btnGhost}>
            {copied ? "Tersalin!" : "Salin link umum"}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="✅"
          label="Tamu hadir"
          value={`${people} orang`}
          hint={`${attending.length} hadir · ${rsvps.length - attending.length} tidak hadir`}
          onClick={() => onNavigate("tamu", "rsvp")}
        />
        <StatCard
          icon="📨"
          label="Undangan dibagikan"
          value={`${sent}/${invitees.length}`}
          onClick={() => onNavigate("undangan")}
        >
          <ProgressBar value={sent} total={invitees.length} />
        </StatCard>
        <StatCard
          icon="💌"
          label="Doa & ucapan"
          value={wishes.length}
          hint={unreplied > 0 ? `${unreplied} belum dibalas` : "semua sudah dibalas"}
          onClick={() => onNavigate("tamu", "ucapan")}
        />
        <StatCard
          icon="🎁"
          label="Kado & uang diterima"
          value={rupiah(giftSum(true))}
          hint={`belum diterima ${rupiah(giftSum(false))}`}
          onClick={() => onNavigate("tamu", "kado")}
        />
        <StatCard
          icon="💰"
          label="Budget terpakai"
          value={rupiah(budgetSum(true))}
          hint={`dari total ${rupiah(budgetTotal)}`}
          onClick={() => onNavigate("budget")}
        >
          <ProgressBar value={budgetSum(true)} total={budgetTotal} />
        </StatCard>
        <StatCard
          icon="🖼️"
          label="Foto terunggah"
          value={Object.values(data.photos).reduce((n, list) => n + list.length, 0)}
          hint="cover, lamaran, galeri"
          onClick={() => onNavigate("foto")}
        />
      </div>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold-light">Perlu perhatian</h2>
        {attention.length === 0 ? (
          <Card className="text-sm text-foreground/70">Semua beres 🎉 Tidak ada yang perlu ditindaklanjuti.</Card>
        ) : (
          attention.map((item) => (
            <button key={item.text} onClick={item.go} className="block w-full text-left">
              <Card className="flex items-center justify-between gap-3 p-3 text-sm">
                <span>⚠️ {item.text}</span>
                <span className="text-gold-light">→</span>
              </Card>
            </button>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold-light">Aktivitas terbaru</h2>
        {activity.length === 0 ? (
          <Card className="text-sm text-foreground/60">Belum ada aktivitas dari tamu.</Card>
        ) : (
          <Card className="divide-y divide-gold/10 p-0">
            {activity.map((a) => (
              <div key={a.key} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5">{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{a.title}</span>
                  </p>
                  <p className="truncate text-xs text-foreground/60">{a.text}</p>
                </div>
                <span className="shrink-0 text-xs text-foreground/45">{timeAgo(a.at)}</span>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
