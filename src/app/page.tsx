"use client";

import { useEffect, useRef, useState } from "react";
import {
  couple,
  weddingDateISO,
  events,
  story,
  initialWishes,
  invitedFamilies,
  giftAccounts,
} from "./data";
import { useCountdown } from "./useCountdown";
import { useReveal } from "./useReveal";
import { useScrollBackground } from "./useScrollBackground";
import { googleCalendarLink, mapsLink } from "./calendar";
import { FloralCorner } from "./Floral";

const BACKGROUNDS = [
  "/images/bg-beach.jpg",
  "/images/bg1.jpg",
  "/images/bg2.jpg",
  "/images/bg3.jpg",
];

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [guest, setGuest] = useState("Bapak/Ibu/Sdr/i");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const bgIndex = useScrollBackground(BACKGROUNDS.length);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    if (to) setGuest(to.replace(/\+/g, " "));
  }, []);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }

  return (
    <main className="mx-auto w-full max-w-md min-h-screen relative overflow-hidden bg-background">
      {opened && (
        <div className="fixed inset-0 max-w-md mx-auto z-0">
          {BACKGROUNDS.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-[opacity,transform] duration-[1800ms] ease-in-out will-change-transform"
              style={{
                backgroundImage: `url(${src})`,
                opacity: i === bgIndex ? 1 : 0,
                transform: i === bgIndex ? "scale(1.08)" : "scale(1)",
                transitionDuration: i === bgIndex ? "1800ms, 6000ms" : "1800ms, 0ms",
              }}
            />
          ))}
        </div>
      )}
      {/* ponytail: add a real royalty-free track at /public/music.mp3 */}
      <audio ref={audioRef} src="/music.mp3" loop />
      {!opened ? (
        <Cover
          guest={guest}
          onOpen={() => {
            setOpened(true);
            toggleMusic();
          }}
        />
      ) : (
        <>
          <Invitation />
          <BottomNav />
          <FloatingTools playing={playing} onToggleMusic={toggleMusic} />
        </>
      )}
    </main>
  );
}

function Cover({ guest, onOpen }: { guest: string; onOpen: () => void }) {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-8 py-16 text-center border border-gold/40 relative bg-cover bg-center"
      style={{ backgroundImage: "url(/images/bg-beach.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/35" />
      <FloralCorner className="absolute -left-4 -top-4 w-32 h-32 opacity-80 z-10" />
      <FloralCorner
        flip
        className="absolute -right-4 -bottom-4 w-32 h-32 opacity-80 z-10"
      />
      <h1 className="relative z-10 font-script text-5xl gold-text leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        {couple.shortGroom}
        <br />& {couple.shortBride}
      </h1>
      <div className="relative z-10 text-sm tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
        <p>Kepada Yth. Bapak/Ibu/Sdr/i</p>
        <p className="font-semibold text-gold-light">{guest}</p>
        <p>di Tempat</p>
      </div>
      <button
        onClick={onOpen}
        className="relative z-10 mt-4 px-6 py-3 border border-white/70 rounded-full text-white tracking-widest text-sm hover:bg-white/10 transition"
      >
        BUKA UNDANGAN
      </button>
    </section>
  );
}

function Invitation() {
  return (
    <div className="relative z-10 pb-24 bg-background/92">
      <HeroSection />
      <CoupleSection />
      <EventSection />
      <StorySection />
      <WishesSection />
      <RsvpSection />
      <ClosingSection />
    </div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  const { ref, className } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-script text-4xl gold-text text-center mb-8">
      {children}
    </h2>
  );
}

function HeroSection() {
  const { days, hours, minutes, seconds } = useCountdown(weddingDateISO);
  return (
    <section className="px-6 pt-16 pb-10 text-center relative">
      <FloralCorner className="absolute -left-6 top-0 w-28 h-28 opacity-70" />
      <FloralCorner
        flip
        className="absolute -right-6 top-40 w-28 h-28 opacity-70"
      />
      <h1 className="font-script text-5xl gold-text mb-6 leading-tight">
        {couple.shortGroom}
        <br />& {couple.shortBride}
      </h1>
      <p className="font-script text-2xl text-gold-light mb-1">Save The Date</p>
      <p className="text-sm mb-6">Sabtu, 10 Oktober 2026</p>
      <div className="flex justify-center gap-3">
        {[
          ["Hari", days],
          ["Jam", hours],
          ["Menit", minutes],
          ["Detik", seconds],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="card-3d border gold-border rounded-md w-16 py-2"
          >
            <div className="text-xl font-semibold text-gold-light">
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CoupleSection() {
  return (
    <section id="mempelai" className="px-6 py-12 text-center scroll-mt-20">
      <Reveal>
        <SectionTitle>Mempelai</SectionTitle>
        <p className="text-sm mb-10 opacity-80">
          Dengan mengucapkan syukur, kami mengundang Bapak/Ibu/Saudara/i untuk
          menghadiri acara pernikahan kami.
        </p>
        <div className="space-y-10">
          {[couple.groom, couple.bride].map((p) => (
            <div key={p.name}>
              <h3 className="font-script text-3xl text-gold-light">
                {p.name}
              </h3>
              <p className="text-xs mt-2 opacity-80">Putra/Putri dari</p>
              <p className="text-sm">{p.parents}</p>
              <p className="text-xs opacity-60 mt-1">{p.city}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function EventSection() {
  return (
    <section id="acara" className="px-6 py-12 text-center scroll-mt-20">
      <Reveal>
        <SectionTitle>Detail Acara</SectionTitle>
        <div className="space-y-8">
          {events.map((e) => (
            <div key={e.title} className="card-3d border gold-border rounded-lg p-6">
              <h3 className="font-script text-3xl text-gold-light mb-2">
                {e.title}
              </h3>
              <p className="text-sm">{e.date}</p>
              <p className="text-sm mb-2">{e.time}</p>
              <p className="text-sm font-semibold">{e.place}</p>
              <p className="text-xs opacity-70 mb-4">{e.address}</p>
              <div className="flex justify-center gap-3 text-xs">
                <a
                  href={mapsLink(`${e.place} ${e.address}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border gold-border rounded-full text-gold-light"
                >
                  BUKA MAP
                </a>
                <a
                  href={googleCalendarLink({
                    title: `${e.title} - ${couple.shortGroom} & ${couple.shortBride}`,
                    startISO: e.startISO,
                    endISO: e.endISO,
                    location: e.address,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border gold-border rounded-full text-gold-light"
                >
                  KALENDER
                </a>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function StorySection() {
  return (
    <section id="love-story" className="px-6 py-12 text-center scroll-mt-20">
      <Reveal>
        <SectionTitle>Our Story</SectionTitle>
        <p className="font-script text-2xl text-gold-light mb-8">
          Feri & Ayu
        </p>
        <div className="space-y-8 text-left">
          {story.map((s) => (
            <div key={s.title} className="border-l-2 gold-border pl-4">
              <h3 className="font-semibold text-lg text-gold-light">
                {s.title}
              </h3>
              <p className="text-xs opacity-60 mb-1">{s.date}</p>
              <p className="text-sm opacity-90">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="text-sm italic opacity-80 mt-10">
          Dulu minta tolong kerjain PR, sekarang minta temani selamanya.
        </p>
        <p className="text-xs text-gold-light mt-2 tracking-wide">
          #FeriAyuTigaBesarDuaArah
        </p>
      </Reveal>
    </section>
  );
}

function WishesSection() {
  const [wishes, setWishes] = useState(initialWishes);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setWishes([{ name, message }, ...wishes]);
    setName("");
    setMessage("");
  }

  return (
    <section id="ucapan" className="px-6 py-12 text-center scroll-mt-20">
      <Reveal>
        <SectionTitle>Doa & Ucapan</SectionTitle>
        <form onSubmit={submit} className="space-y-3 mb-4 text-left">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            className="w-full bg-background border gold-border rounded-md px-4 py-2 text-sm outline-none shadow-sm"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pesan untuk mempelai :"
            rows={3}
            className="w-full bg-background border gold-border rounded-md px-4 py-2 text-sm outline-none shadow-sm"
          />
          <button
            type="submit"
            className="btn-3d w-full px-4 py-2 rounded-full text-sm font-medium"
          >
            KIRIM PESAN
          </button>
        </form>
        <button
          onClick={() => setGiftOpen(true)}
          className="btn-3d w-full mb-8 px-4 py-2 rounded-full text-sm font-medium"
        >
          KIRIM KADO
        </button>
        <div className="space-y-4 text-left">
          {wishes.map((w, i) => (
            <div key={i} className="border-b border-gold/20 pb-3">
              <p className="text-sm font-semibold text-gold-light">
                {w.name}
              </p>
              <p className="text-sm opacity-80">{w.message}</p>
            </div>
          ))}
        </div>
      </Reveal>
      {giftOpen && <GiftModal onClose={() => setGiftOpen(false)} />}
    </section>
  );
}

function GiftModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(number: string) {
    navigator.clipboard
      .writeText(number)
      .then(() => {
        setCopied(number);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(() => {});
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div
        className="card-3d border gold-border rounded-lg p-6 w-full max-w-sm text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-script text-3xl text-gold-light text-center mb-4">
          Kirim Kado
        </h3>
        <div className="space-y-4">
          {giftAccounts.map((g) => (
            <div
              key={g.number}
              className="border gold-border rounded-md p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gold-light">
                  {g.bank}
                </p>
                <p className="text-sm">{g.number}</p>
                <p className="text-xs opacity-70">a.n {g.name}</p>
              </div>
              <button
                onClick={() => copy(g.number)}
                className="text-xs px-3 py-1 border gold-border rounded-full text-gold-light"
              >
                {copied === g.number ? "Tersalin" : "Salin"}
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 border gold-border rounded-full text-gold-light text-sm"
        >
          TUTUP
        </button>
      </div>
    </div>
  );
}

function RsvpSection() {
  type Rsvp = { name: string; attend: "Hadir" | "Tidak Hadir"; guests: number };
  const [list, setList] = useState<Rsvp[]>([]);
  const [name, setName] = useState("");
  const [attend, setAttend] = useState<Rsvp["attend"]>("Hadir");
  const [guests, setGuests] = useState(1);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setList([{ name, attend, guests }, ...list]);
    setName("");
    setGuests(1);
  }

  return (
    <section id="rsvp" className="px-6 py-12 text-center scroll-mt-20">
      <Reveal>
        <SectionTitle>RSVP / Kehadiran</SectionTitle>
        <form onSubmit={submit} className="space-y-3 mb-8 text-left">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            className="w-full bg-background border gold-border rounded-md px-4 py-2 text-sm outline-none shadow-sm"
          />
          <div className="flex gap-3">
            {(["Hadir", "Tidak Hadir"] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setAttend(opt)}
                className={`flex-1 px-3 py-2 rounded-full text-xs border gold-border ${
                  attend === opt ? "bg-gold/20 text-gold-light" : "text-foreground/70"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {attend === "Hadir" && (
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              placeholder="Jumlah tamu"
              className="w-full bg-background border gold-border rounded-md px-4 py-2 text-sm outline-none shadow-sm"
            />
          )}
          <button
            type="submit"
            className="btn-3d w-full px-4 py-2 rounded-full text-sm font-medium"
          >
            KIRIM KONFIRMASI
          </button>
        </form>
        <div className="space-y-3 text-left">
          {list.map((r, i) => (
            <div
              key={i}
              className="border-b border-gold/20 pb-2 flex justify-between text-sm"
            >
              <span className="text-gold-light">{r.name}</span>
              <span className="opacity-70">
                {r.attend}
                {r.attend === "Hadir" ? ` (${r.guests})` : ""}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="px-6 py-16 text-center relative">
      <FloralCorner className="absolute -left-6 -bottom-6 w-32 h-32 opacity-70" />
      <FloralCorner
        flip
        className="absolute -right-6 -bottom-6 w-32 h-32 opacity-70"
      />
      <p className="text-sm mb-6 opacity-80">
        Atas doa & ucapan bapak/ibu/saudara/i, Kami mengucapkan terima kasih.
      </p>
      <p className="text-sm mb-2">Salam</p>
      <h2 className="font-script text-4xl gold-text mb-10">
        {couple.shortGroom} & {couple.shortBride}
      </h2>

      <h3 className="font-script text-2xl text-gold-light mb-4">
        Turut Mengundang
      </h3>
      <div className="grid grid-cols-2 gap-6 text-xs text-left mb-10">
        <div>
          <p className="font-semibold text-gold-light mb-2">
            Kel. Mempelai Pria
          </p>
          <ul className="space-y-1 opacity-80">
            {invitedFamilies.groom.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gold-light mb-2">
            Kel. Mempelai Wanita
          </p>
          <ul className="space-y-1 opacity-80">
            {invitedFamilies.bride.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-[10px] opacity-40">Website by : undangan</p>
    </section>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.3 5 5.5 5c1.9 0 3.4 1 4.5 2.5C11.1 6 12.6 5 14.5 5 17.7 5 19.2 8.2 21.5 11.5 19 15.65 12 20 12 20Z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M4 4.5C4 3.7 4.7 3 5.5 3H12v18H5.5c-.8 0-1.5-.7-1.5-1.5v-15Z" />
      <path d="M20 4.5c0-.8-.7-1.5-1.5-1.5H12v18h6.5c.8 0 1.5-.7 1.5-1.5v-15Z" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "mempelai", label: "Mempelai", Icon: IconHeart },
  { id: "acara", label: "Acara", Icon: IconCalendar },
  { id: "love-story", label: "Love Story", Icon: IconBook },
  { id: "ucapan", label: "Ucapan", Icon: IconEnvelope },
];

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 border-t gold-border flex justify-around py-2 z-40">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          className="flex flex-col items-center text-[10px] text-foreground/70 hover:text-gold-light px-1"
        >
          <span className="mb-1 text-gold-light">
            <Icon />
          </span>
          {label}
        </a>
      ))}
    </nav>
  );
}

function FloatingTools({
  playing,
  onToggleMusic,
}: {
  playing: boolean;
  onToggleMusic: () => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [url, setUrl] = useState("");

  function openQr() {
    setUrl(typeof window !== "undefined" ? window.location.href : "");
    setQrOpen(true);
  }

  return (
    <>
      <button
        onClick={onToggleMusic}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full border gold-border bg-background/80 flex items-center justify-center text-gold-light text-xs"
        aria-label="Toggle music"
      >
        <span className={playing ? "animate-spin-slow" : ""}>♪</span>
      </button>
      <button
        onClick={openQr}
        className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full border gold-border bg-background/80 flex items-center justify-center text-gold-light text-xs"
        aria-label="Show QR"
      >
        QR
      </button>
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="card-3d border gold-border rounded-lg p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                url
              )}`}
              alt="QR undangan"
              className="mx-auto mb-4"
              width={200}
              height={200}
            />
            <p className="text-xs opacity-70 mb-4 break-all max-w-[200px]">
              {url}
            </p>
            <button
              onClick={() => setQrOpen(false)}
              className="px-4 py-2 border gold-border rounded-full text-gold-light text-sm"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}
    </>
  );
}
