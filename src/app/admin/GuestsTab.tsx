"use client";

import type { AdminData, Reload } from "./types";
import { GiftsPanel } from "./GiftsPanel";
import { RsvpPanel } from "./RsvpPanel";
import { WishesPanel } from "./WishesPanel";
import { Chips } from "./ui";

export type GuestsSub = "rsvp" | "ucapan" | "kado";

export function GuestsTab({
  data,
  reload,
  sub,
  onSub,
}: {
  data: AdminData;
  reload: Reload;
  sub: GuestsSub;
  onSub: (sub: GuestsSub) => void;
}) {
  return (
    <div className="space-y-4">
      <Chips
        value={sub}
        onChange={onSub}
        options={[
          { value: "rsvp", label: "✅ RSVP", count: data.rsvps.length },
          { value: "ucapan", label: "💌 Ucapan", count: data.wishes.length },
          { value: "kado", label: "🎁 Kado & Uang", count: data.contributions.length },
        ]}
      />
      {sub === "rsvp" && <RsvpPanel rsvps={data.rsvps} reload={reload} />}
      {sub === "ucapan" && <WishesPanel wishes={data.wishes} reload={reload} />}
      {sub === "kado" && <GiftsPanel contributions={data.contributions} reload={reload} />}
    </div>
  );
}
