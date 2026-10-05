"use client";

/** Kelas bersama supaya seluruh dashboard konsisten. */
export const inputClass =
  "w-full rounded-xl border border-gold/25 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15";
export const btnPrimary =
  "rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50";
export const btnGhost =
  "rounded-full border border-gold/40 px-3 py-1.5 text-xs font-medium text-gold-light";
export const btnDanger = "px-1 text-xs font-medium text-red-600";

/**
 * Kirim perubahan ke API admin. Sesi habis → kembali ke halaman login.
 * Gagal lain → beri tahu pengguna. Mengembalikan true bila berhasil.
 */
export async function send(method: "POST" | "PATCH" | "PUT" | "DELETE", url: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    window.location.replace("/admin/login");
    return false;
  }
  if (!res.ok) {
    window.alert(`Gagal menyimpan (kode ${res.status}). Coba lagi.`);
    return false;
  }
  return true;
}

export function rupiah(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

/** "5 mnt lalu", "3 jam lalu", "2 hari lalu"; lebih dari seminggu → tanggal. */
export function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "baru saja";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mnt lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/** Unduh tabel sebagai CSV (UTF-8 + BOM supaya Excel membaca huruf dengan benar). */
export function downloadCsv(filename: string, rows: string[][]) {
  const body = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + body], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-gold/15 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-gold/15" role="progressbar" aria-valuenow={percent}>
      <div
        className="h-full rounded-full bg-linear-to-r from-[#e08a5c] to-[#a6552a] transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/** Pilihan satu-dari-banyak berbentuk pil (filter, sub-tab). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
            value === o.value
              ? "border-gold bg-gold text-white"
              : "border-gold/30 bg-white text-gold-light"
          }`}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-gold/30 px-4 py-8 text-center text-sm text-foreground/55">
      {children}
    </p>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "green" | "red" | "gold" | "gray";
  children: React.ReactNode;
}) {
  const tones = {
    green: "border-green-600/40 bg-green-50 text-green-700",
    red: "border-red-400 bg-red-50 text-red-700",
    gold: "border-gold/40 bg-gold/10 text-gold-light",
    gray: "border-foreground/15 bg-foreground/5 text-foreground/60",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
