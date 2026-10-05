"use client";

import { useState } from "react";
import type { Reload, Wish } from "./types";
import { Card, Chips, Empty, btnDanger, btnGhost, btnPrimary, inputClass, send, timeAgo } from "./ui";

type Filter = "semua" | "belum";

export function WishesPanel({ wishes, reload }: { wishes: Wish[]; reload: Reload }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const unreplied = wishes.filter((w) => !w.reply).length;
  const shown = filter === "belum" ? wishes.filter((w) => !w.reply) : wishes;

  function toggleReply(w: Wish) {
    setReplyOpen(replyOpen === w.id ? null : w.id);
    setDraft(w.reply ?? "");
  }

  async function saveReply(id: number) {
    await send("PATCH", "/api/admin/wishes", { id, reply: draft });
    setReplyOpen(null);
    setDraft("");
    await reload();
  }

  async function remove(w: Wish) {
    if (!window.confirm(`Hapus ucapan dari ${w.name}?`)) return;
    await send("DELETE", "/api/admin/wishes", { id: w.id });
    await reload();
  }

  return (
    <div className="space-y-4">
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "semua", label: "Semua", count: wishes.length },
          { value: "belum", label: "Belum dibalas", count: unreplied },
        ]}
      />
      <div className="space-y-3">
        {shown.map((w) => (
          <Card key={w.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{w.name}</p>
                <p className="text-xs text-foreground/50">{timeAgo(w.created_at)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => toggleReply(w)} className={btnGhost}>
                  {w.reply ? "Ubah balasan" : "Balas"}
                </button>
                <button onClick={() => remove(w)} className={btnDanger}>
                  Hapus
                </button>
              </div>
            </div>
            <p className="break-words text-sm text-foreground/80">{w.message}</p>
            {w.reply && replyOpen !== w.id && (
              <p className="rounded-xl bg-gold/10 px-3 py-2 text-xs text-foreground/80">
                <span className="font-semibold text-gold-light">Balasan:</span> {w.reply}
              </p>
            )}
            {replyOpen === w.id && (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Tulis balasan… (kosongkan untuk menghapus balasan)"
                  className={inputClass}
                />
                <button onClick={() => saveReply(w.id)} className={`${btnPrimary} py-2 text-xs`}>
                  Simpan balasan
                </button>
              </div>
            )}
          </Card>
        ))}
        {shown.length === 0 && (
          <Empty>{wishes.length === 0 ? "Belum ada ucapan." : "Semua ucapan sudah dibalas 🎉"}</Empty>
        )}
      </div>
    </div>
  );
}
