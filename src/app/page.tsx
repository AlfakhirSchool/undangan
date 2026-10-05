"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { couple, weddingDateISO, events, story, giftAccounts } from "./data";
import { useCountdown } from "./useCountdown";
import { useScrollBackground } from "./useScrollBackground";
import { googleCalendarLink, mapsLink } from "./calendar";
import { FloralCorner, FloralDivider } from "./Floral";
import {
  Hearts,
  Reveal,
  ScrollLine,
  ScrollProgress,
  Sparkles,
  TiltCard,
  useScrollMotion,
} from "./effects";
import { titleCase } from "@/lib/text";
import { PHOTO_DEFAULTS, TEXT_DEFAULTS, type PhotoSlot } from "@/lib/site-content";

type SitePhotos = Record<PhotoSlot, string[]>;

/**
 * Gabungkan foto dari database dengan foto bawaan. Cover dan galeri yang dikosongkan
 * tetap memakai bawaan (undangan tidak boleh tanpa cover). Slot lain yang dikosongkan
 * dari dashboard sengaja dibiarkan kosong, dan bagiannya disembunyikan.
 */
function resolvePhotos(data: Record<string, string[]>): SitePhotos {
  const listOrDefault = (slot: PhotoSlot) =>
    data[slot]?.length ? data[slot] : PHOTO_DEFAULTS[slot];
  const savedOrDefault = (slot: PhotoSlot) => (slot in data ? data[slot] : PHOTO_DEFAULTS[slot]);
  return {
    beach: listOrDefault("beach"),
    gallery1: listOrDefault("gallery1"),
    gallery2: listOrDefault("gallery2"),
    lamaran: savedOrDefault("lamaran"),
    hero: savedOrDefault("hero"),
    break1: savedOrDefault("break1"),
    break2: savedOrDefault("break2"),
    closing: savedOrDefault("closing"),
  };
}

// Posisi/kecepatan kelopak deterministik supaya SSR dan klien sama.
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: `${10 + ((i * 7) % 8)}px`,
  dur: `${9 + ((i * 5) % 7)}s`,
  delay: `-${((i * 1.7) % 12).toFixed(1)}s`,
  drift: `${(i % 2 ? 1 : -1) * (20 + ((i * 13) % 40))}px`,
}));

const WEDDING_DATE_SHORT = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Jakarta",
})
  .format(new Date(weddingDateISO))
  .replace(/\//g, " · ");

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [guest, setGuest] = useState("Bapak/Ibu/Sdr/i");
  const [nameLocked, setNameLocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [photos, setPhotos] = useState<SitePhotos>(PHOTO_DEFAULTS);
  const [texts, setTexts] = useState(TEXT_DEFAULTS);
  const bgIndex = useScrollBackground(photos.beach.length);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data: Record<string, string[]>) => setPhotos(resolvePhotos(data)))
      .catch(() => {});
    fetch("/api/texts")
      .then((r) => r.json())
      .then((data: Record<string, string>) => setTexts({ ...TEXT_DEFAULTS, ...data }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const to = new URLSearchParams(window.location.search).get("to");
    if (!to) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must run post-mount to avoid SSR/client hydration mismatch on window.location
    setGuest(to.replace(/\+/g, " "));
    setNameLocked(true);
  }, []);

  function fadeInMusic(audio: HTMLAudioElement) {
    audio.volume = 0;
    audio.play().catch(() => {});
    const id = setInterval(() => {
      audio.volume = Math.min(1, audio.volume + 0.05);
      if (audio.volume >= 1) clearInterval(id);
    }, 150);
  }

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      if (audio.currentTime === 0) {
        if (audio.readyState >= 1) {
          audio.currentTime = 154;
        } else {
          audio.addEventListener("loadedmetadata", () => (audio.currentTime = 154), {
            once: true,
          });
        }
      }
      fadeInMusic(audio);
    }
    setPlaying(!playing);
  }

  function openInvitation() {
    setClosing(true);
    toggleMusic();
    setTimeout(() => setOpened(true), 1500);
  }

  return (
    <main
      className={`invite-ui mx-auto w-full max-w-md relative overflow-hidden bg-background ${
        opened ? "min-h-dvh" : "h-dvh"
      }`}
    >
      <div className="fixed inset-0 max-w-md mx-auto z-0">
        {photos.beach.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1800ms] ease-in-out"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === bgIndex ? 1 : 0,
            }}
          />
        ))}
      </div>
      <audio
        ref={audioRef}
        src="/music.mp3"
        onEnded={(e) => {
          const audio = e.currentTarget;
          audio.currentTime = 154;
          audio.play().catch(() => {});
        }}
      />
      <Invitation
        revealed={closing}
        guest={guest}
        nameLocked={nameLocked}
        photos={photos}
        texts={texts}
      />
      <Sparkles className="fixed inset-0 z-30 mx-auto max-w-md" />
      <ScrollProgress />
      <BottomNav />
      <FloatingTools playing={playing} onToggleMusic={toggleMusic} />
      {!opened && (
        <Cover
          guest={guest}
          closing={closing}
          onOpen={openInvitation}
          beachPhotos={photos.beach}
        />
      )}
    </main>
  );
}

// Sampul undangan di atas isi undangan; saat dibuka berayun 3D seperti sampul buku.
function Cover({
  guest,
  closing,
  onOpen,
  beachPhotos,
}: {
  guest: string;
  closing: boolean;
  onOpen: () => void;
  beachPhotos: string[];
}) {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % beachPhotos.length);
    }, 4000);
    return () => clearInterval(id);
  }, [beachPhotos.length]);

  const named = guest !== "Bapak/Ibu/Sdr/i";

  return (
    <div className={`book fixed inset-0 z-50 mx-auto max-w-md ${closing ? "is-open" : ""}`}>
      <div className="book-cast pointer-events-none absolute inset-0" />
      <div className="book-leaf absolute inset-0">
        <section className="book-cover absolute inset-0 flex flex-col items-center justify-end gap-6 overflow-hidden border border-gold/40 bg-foreground px-8 pt-10 pb-16 text-center">
          {beachPhotos.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
              style={{ backgroundImage: `url(${src})`, opacity: i === bgIndex ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {PETALS.map((p, i) => (
              <span
                key={i}
                className="petal"
                style={
                  {
                    left: p.left,
                    "--size": p.size,
                    "--dur": p.dur,
                    "--delay": p.delay,
                    "--drift": p.drift,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 z-10 w-3 bg-linear-to-r from-black/45 to-transparent" />
          <FloralCorner className="absolute -left-4 -top-4 w-32 h-32 opacity-80 z-10" />
          <FloralCorner
            flip
            className="absolute -right-4 -bottom-4 w-32 h-32 opacity-80 z-10"
          />
          <div className="relative z-10 flex flex-col items-center gap-2 text-white">
            <p className="text-xs tracking-[0.3em] uppercase opacity-85">The Wedding Of</p>
            <h1 className="font-script text-6xl leading-tight text-[#ffe3c2] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {couple.shortGroom} &amp; {couple.shortBride}
            </h1>
            <p className="text-sm tracking-wide opacity-90">{events[0].date}</p>
            <div className="mt-5 text-sm opacity-95">
              <p>Kepada Yth.</p>
              <p className="font-semibold text-[#ffd9a8] text-lg my-0.5">
                {named ? `${titleCase(guest)} & Partner` : "Bapak/Ibu/Saudara/i"}
              </p>
              <p>di Tempat</p>
            </div>
          </div>
          <button
            onClick={onOpen}
            disabled={closing}
            className="btn-3d relative z-10 mt-1 px-8 py-3 rounded-full tracking-widest text-sm font-medium"
          >
            BUKA UNDANGAN
          </button>
          <div className="book-shade pointer-events-none absolute inset-0 z-20" />
        </section>
        <div
          className="book-back absolute inset-0 flex items-center justify-center border border-gold/40"
          aria-hidden="true"
        >
          <FloralCorner className="absolute -left-4 -top-4 w-32 h-32 opacity-60" />
          <FloralCorner flip className="absolute -right-4 -bottom-4 w-32 h-32 opacity-60" />
          <p className="font-script text-5xl gold-text">
            {couple.shortGroom.charAt(0)} &amp; {couple.shortBride.charAt(0)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Invitation({
  revealed,
  guest,
  nameLocked,
  photos,
  texts,
}: {
  revealed: boolean;
  guest: string;
  nameLocked: boolean;
  photos: SitePhotos;
  texts: typeof TEXT_DEFAULTS;
}) {
  return (
    <div className="relative z-10 pb-24 bg-background/90">
      <HeroSection revealed={revealed} photo={photos.hero[0]} />
      <CoupleSection />
      <PhotoBreak src={photos.break1[0]} caption={texts.break1_caption} />
      <EventSection />
      <StorySection />
      <PhotoBreak src={photos.break2[0]} caption={texts.break2_caption} />
      {photos.lamaran.length > 0 && (
        <section className="px-6 py-8 text-center scroll-mt-0">
          <Reveal>
            <SectionTitle kicker="The Proposal">Lamaran</SectionTitle>
            <PhotoCarousel photos={photos.lamaran} />
          </Reveal>
        </section>
      )}
      <GallerySection photos={photos.gallery1} photos2={photos.gallery2} />
      <WishesSection guest={guest} nameLocked={nameLocked} />
      <RsvpSection guest={guest} nameLocked={nameLocked} />
      <GiftSection />
      <ClosingSection photo={photos.closing[0]} />
    </div>
  );
}

function SectionTitle({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.45em] text-gold-light/80">
        {kicker}
      </p>
      <h2 className="font-script gold-shimmer py-1 text-[2.7rem] leading-tight">{children}</h2>
      <FloralDivider className="mt-1" />
    </div>
  );
}

/**
 * Foto penuh selebar layar: zoom pelan (Ken Burns) + parallax (bergeser lebih lambat
 * dari scroll). Tepinya memudar lewat mask supaya menyatu tanpa garis dengan latar.
 * Mode `natural` menampilkan foto utuh sesuai rasionya (tanpa parallax dan hanya zoom
 * sangat halus), untuk foto badan penuh yang tidak boleh terpotong.
 */
function FullBleedPhoto({
  src,
  className = "",
  fadeTop = true,
  natural = false,
}: {
  src: string;
  className?: string;
  fadeTop?: boolean;
  natural?: boolean;
}) {
  const parallax = useScrollMotion<HTMLDivElement>(
    (p) => `translate3d(0, ${(p * 0.1 * window.innerHeight).toFixed(1)}px, 0)`
  );
  const mask = `linear-gradient(to bottom, ${fadeTop ? "transparent, black 22%" : "black"}, black 50%, transparent)`;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    >
      {natural ? (
        <div
          className="kenburns-soft absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        <div ref={parallax} className="absolute inset-x-0 -top-[18%] -bottom-[18%]">
          <div
            className="kenburns absolute inset-0 bg-cover bg-[center_30%]"
            style={{ backgroundImage: `url(${src})` }}
          />
        </div>
      )}
    </div>
  );
}

function PhotoBreak({ src, caption }: { src?: string; caption: string }) {
  if (!src) return null;
  return (
    <figure className="relative my-2">
      <FullBleedPhoto src={src} className="h-[62svh]" />
      {caption && (
        <figcaption className="relative -mt-16 px-8 text-center">
          <Reveal variant="zoom">
            <p className="font-script text-4xl text-gold-light">{caption}</p>
          </Reveal>
        </figcaption>
      )}
    </figure>
  );
}

function HeroSection({ revealed, photo }: { revealed: boolean; photo?: string }) {
  const { days, hours, minutes, seconds } = useCountdown(weddingDateISO);
  const item = revealed ? "hero-item hero-item-in" : "hero-item";
  const first = events[0];
  const last = events[events.length - 1];
  return (
    <section className="relative text-center">
      {photo && (
        <div className="relative">
          <FullBleedPhoto src={photo} fadeTop={false} natural className="aspect-[853/1280]" />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/25 to-transparent" />
        </div>
      )}
      <div className={`relative px-6 ${photo ? "-mt-40" : "pt-24"}`}>
        <p
          className={`font-display text-xs font-semibold uppercase tracking-[0.5em] text-gold-light ${item}`}
          style={{ transitionDelay: "0.4s" }}
        >
          The Wedding Of
        </p>
        <h1
          className={`font-script gold-shimmer py-1 text-7xl leading-tight ${item}`}
          style={{ transitionDelay: "0.65s" }}
        >
          {couple.shortGroom} &amp; {couple.shortBride}
        </h1>
        <p
          className={`font-display text-sm font-semibold tracking-[0.45em] ${item}`}
          style={{ transitionDelay: "0.95s" }}
        >
          {WEDDING_DATE_SHORT}
        </p>
      </div>
      <div className="px-6 pt-12 pb-10">
        <Reveal>
          <p className="font-script text-3xl text-gold-light">Save The Date</p>
          <p className="mb-5 text-sm">{first.date}</p>
          <div className="flex justify-center gap-3">
            {[
              ["Hari", days],
              ["Jam", hours],
              ["Menit", minutes],
              ["Detik", seconds],
            ].map(([label, value]) => {
              const text = String(value).padStart(2, "0");
              return (
                <div
                  key={label as string}
                  className="card-3d border gold-border rounded-md w-16 py-2"
                >
                  <div className="text-xl font-semibold text-gold-light">
                    <span key={text} className="flip-digit">
                      {text}
                    </span>
                  </div>
                  <div className="text-[11px] uppercase tracking-wide">{label}</div>
                </div>
              );
            })}
          </div>
          <a
            href={googleCalendarLink({
              title: `Pernikahan ${couple.shortGroom} & ${couple.shortBride}`,
              startISO: first.startISO,
              endISO: last.endISO,
              location: `${first.place}, ${first.address}`,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border gold-border px-5 py-2 text-xs font-semibold tracking-[0.2em] text-gold-light"
          >
            <IconCalendar className="h-3.5 w-3.5" />
            SIMPAN TANGGAL
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function CoupleSection() {
  return (
    <section id="mempelai" className="px-6 py-8 text-center scroll-mt-0">
      <Reveal>
        <SectionTitle kicker="The Couple">Mempelai</SectionTitle>
        <p className="mb-7 text-sm leading-relaxed opacity-90">
          Dengan mengucapkan syukur, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara
          pernikahan kami.
        </p>
      </Reveal>
      {[couple.groom, couple.bride].map((p, i) => (
        <Fragment key={p.name}>
          {i === 1 && (
            <Reveal variant="zoom">
              <p className="font-script gold-shimmer my-2 py-1 text-6xl">&amp;</p>
            </Reveal>
          )}
          <Reveal variant={i ? "right" : "left"}>
            <TiltCard className="card-3d relative overflow-hidden rounded-2xl border gold-border px-5 py-8">
              <span
                className="font-script pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[11rem] leading-none text-gold/10"
                aria-hidden="true"
              >
                {p.name.charAt(0)}
              </span>
              <div className="relative">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 gold-border bg-linear-to-br from-[#fff7ec] to-[#f1e1cc] shadow-inner">
                  <span className="font-script gold-text px-2 pt-2 text-5xl leading-none">
                    {p.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-script text-3xl text-gold-light">{p.name}</h3>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] opacity-70">{p.order}</p>
                <p className="mt-1 text-sm font-semibold">{p.parents}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs opacity-75">
                  <IconPin />
                  {p.city}
                </p>
              </div>
            </TiltCard>
          </Reveal>
        </Fragment>
      ))}
    </section>
  );
}

function EventSection() {
  return (
    <section id="acara" className="px-6 py-8 text-center scroll-mt-0">
      <Reveal>
        <SectionTitle kicker="The Event">Detail Acara</SectionTitle>
      </Reveal>
      <div className="space-y-5">
        {events.map((e, i) => {
          const [dayName, rest] = e.date.split(", ");
          const [day, month, year] = rest.split(" ");
          return (
            <Reveal key={e.title} variant={i % 2 ? "right" : "left"}>
              <TiltCard className="card-3d rounded-2xl border gold-border p-6">
                <h3 className="font-script text-3xl text-gold-light">{e.title}</h3>
                <div className="my-4 flex items-center justify-center gap-4">
                  <p className="w-20 text-right text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    {dayName}
                  </p>
                  <p className="font-display border-x gold-border px-4 text-5xl font-semibold leading-none text-gold-light">
                    {day}
                  </p>
                  <p className="w-20 text-left text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    {month}
                    <br />
                    {year}
                  </p>
                </div>
                <p className="flex items-center justify-center gap-1.5 text-sm">
                  <IconClock />
                  {e.time}
                </p>
                <div className="mt-4 border-t border-gold/20 pt-4">
                  <p className="text-sm font-semibold">{e.place}</p>
                  <p className="mt-1 text-xs opacity-80">{e.address}</p>
                </div>
                <div className="mt-5 flex justify-center gap-3 text-xs">
                  <a
                    href={mapsLink(`${e.place} ${e.address}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-medium"
                  >
                    <IconPin />
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 border gold-border rounded-full text-gold-light font-medium"
                  >
                    <IconClock />
                    KALENDER
                  </a>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section id="love-story" className="px-6 py-8 text-center scroll-mt-0">
      <Reveal>
        <SectionTitle kicker="Our Journey">Our Story</SectionTitle>
      </Reveal>
      <div className="relative text-left">
        <span className="absolute left-[11px] top-3 bottom-3 w-px bg-gold/15" aria-hidden="true" />
        <ScrollLine className="absolute left-[10px] top-3 bottom-3 w-[3px] rounded-full bg-linear-to-b from-[#e8a07a] to-[#a6552a]" />
        <div className="space-y-5">
          {story.map((s) => (
            <Reveal key={s.title}>
              <div className="relative pl-9">
                <span className="node-pop absolute left-0 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px] text-white shadow ring-4 ring-background">
                  ♥
                </span>
                <div className="card-3d rounded-xl border border-gold/30 p-4">
                  <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold-light">
                    {s.date}
                  </span>
                  <h3 className="font-script mt-1 text-2xl text-gold-light">{s.title}</h3>
                  <p className="text-sm leading-relaxed opacity-90">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal>
        <p className="font-display mt-10 text-lg font-medium italic leading-snug opacity-90">
          Dulu minta tolong kerjain PR, sekarang minta temani selamanya.
        </p>
        <p className="mt-2 text-xs tracking-wide text-gold-light">#FeriAyuTigaBesarDuaArah</p>
      </Reveal>
    </section>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % photos.length);
    }, 5000);
    return () => clearInterval(id);
  }, [photos]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    setActive((i) => {
      const next = delta < 0 ? i + 1 : i - 1;
      return (next + photos.length) % photos.length;
    });
  }

  return (
    <>
      <div
        className="coverflow relative mx-auto aspect-[3/4] w-full max-w-[15rem] touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="absolute -inset-x-10 -bottom-6 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(199,107,57,0.28),transparent_70%)] blur-xl"
          aria-hidden="true"
        />
        <div className="coverflow-stage absolute inset-0">
          {photos.map((src, i) => {
            const n = photos.length;
            let offset = i - active;
            if (offset > n / 2) offset -= n;
            if (offset < -n / 2) offset += n;
            const distance = Math.abs(offset);
            return (
              <div
                key={src}
                onClick={() => setActive(i)}
                aria-hidden="true"
                className="coverflow-item absolute inset-0 rounded-xl border-2 gold-border bg-cover bg-center"
                style={{
                  backgroundImage: `url(${src})`,
                  transform: `translateX(${offset * 58}%) translateZ(${-distance * 150}px) rotateY(${-offset * 40}deg)`,
                  opacity: distance > 1 ? 0 : 1,
                  filter: distance === 0 ? "none" : "brightness(0.75)",
                  zIndex: 10 - distance,
                  pointerEvents: distance > 1 ? "none" : "auto",
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-14 flex justify-center gap-2">
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            aria-label={`Foto ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-gold" : "w-2 bg-gold/30"
            }`}
          />
        ))}
      </div>
    </>
  );
}

function VideoClip({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full aspect-[4/5] object-cover rounded-xl border gold-border shadow-md"
    />
  );
}

function GallerySection({ photos, photos2 }: { photos: string[]; photos2: string[] }) {
  return (
    <section id="gallery" className="px-6 py-8 text-center scroll-mt-0">
      <Reveal>
        <SectionTitle kicker="Gallery">Galeri Kami</SectionTitle>
        <PhotoCarousel photos={photos} />
        <div className="mt-6">
          <PhotoCarousel photos={photos2} />
        </div>
        <div className="mt-6">
          <VideoClip src="/videos/story.mp4" />
        </div>
      </Reveal>
    </section>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#c8703c] to-[#7d3f1f] text-sm font-semibold text-white shadow">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function WishesSection({ guest, nameLocked }: { guest: string; nameLocked: boolean }) {
  const [wishes, setWishes] = useState<{ name: string; message: string; reply?: string | null }[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/wishes")
      .then((r) => r.json())
      .then((data) => setWishes(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill from URL guest name post-mount
    if (new URLSearchParams(window.location.search).get("to")) setName(guest);
  }, [guest]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setWishes([{ name, message }, ...wishes]);
    setMessage("");
    await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
  }

  return (
    <section id="ucapan" className="px-6 py-8 text-center scroll-mt-0">
      <Reveal>
        <SectionTitle kicker="Wishes">Doa & Ucapan</SectionTitle>
        <form onSubmit={submit} className="space-y-3 mb-4 text-left">
          <input
            aria-label="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={nameLocked}
            placeholder="Nama"
            className="w-full bg-white/80 border gold-border rounded-xl px-4 py-2.5 text-sm outline-none shadow-sm read-only:opacity-70"
          />
          <textarea
            aria-label="Pesan untuk mempelai"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pesan untuk mempelai :"
            rows={3}
            className="w-full bg-white/80 border gold-border rounded-xl px-4 py-2.5 text-sm outline-none shadow-sm"
          />
          <button
            type="submit"
            className="btn-3d w-full px-4 py-2 rounded-full text-sm font-medium"
          >
            KIRIM PESAN
          </button>
        </form>
        {wishes.length > 0 && (
          <p className="font-display mb-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            {wishes.length} Ucapan
          </p>
        )}
        <div className="space-y-3 text-left max-h-80 overflow-y-auto pr-1">
          {wishes.map((w, i) => (
            <div key={i} className="flex gap-3">
              <Avatar name={w.name} />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-gold/20 bg-white/75 px-3.5 py-2.5 shadow-sm">
                <p className="text-sm font-semibold text-gold-light">{w.name}</p>
                <p className="text-sm opacity-85 break-words">{w.message}</p>
                {w.reply && (
                  <p className="mt-2 rounded-xl bg-gold/10 px-3 py-2 text-xs">
                    <span className="font-semibold text-gold-light">Feri &amp; Ayu:</span> {w.reply}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function GiftSection() {
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
    <section id="hadiah" className="px-6 py-8 text-center">
      <Reveal>
        <SectionTitle kicker="Gift">Amplop Digital</SectionTitle>
        <p className="mb-5 text-sm leading-relaxed opacity-90">
          Doa restu Anda adalah karunia yang sangat berarti bagi kami. Namun jika ingin memberikan
          tanda kasih, dapat melalui:
        </p>
      </Reveal>
      <div className="space-y-4">
        {giftAccounts.map((g, i) => (
          <Reveal key={g.number} variant={i % 2 ? "right" : "left"}>
            <TiltCard
              className="gift-card relative overflow-hidden rounded-2xl p-5 text-left text-white"
              max={11}
            >
              <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <span className="pointer-events-none absolute -right-2 top-16 h-24 w-24 rounded-full bg-white/5" />
              <div className="relative flex items-start justify-between">
                <p className="text-lg font-bold italic tracking-wider">{g.bank}</p>
                <span
                  className="h-7 w-10 rounded-md bg-linear-to-br from-[#f6dfa6] to-[#c99a4a] shadow-inner"
                  aria-hidden="true"
                />
              </div>
              <p className="relative mt-6 text-xl font-semibold tracking-[0.15em]">
                {g.number.replace(/(\d{4})(?=\d)/g, "$1 ")}
              </p>
              <div className="relative mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-75">Atas Nama</p>
                  <p className="truncate text-sm font-semibold">{g.name}</p>
                </div>
                <button
                  onClick={() => copy(g.number)}
                  className="shrink-0 rounded-full border border-white/50 bg-white/15 px-4 py-1.5 text-xs font-medium"
                >
                  {copied === g.number ? "Tersalin ✓" : "Salin"}
                </button>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RsvpSection({ guest, nameLocked }: { guest: string; nameLocked: boolean }) {
  type Rsvp = { name: string; attend: "Hadir" | "Tidak Hadir"; guests: number };
  const [list, setList] = useState<Rsvp[]>([]);
  const [name, setName] = useState("");
  const [attend, setAttend] = useState<Rsvp["attend"]>("Hadir");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data) => setList(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill from URL guest name post-mount
    if (new URLSearchParams(window.location.search).get("to")) setName(guest);
  }, [guest]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setList([{ name, attend, guests }, ...list]);
    setName("");
    setGuests(1);
    await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, attend, guests }),
    });
  }

  return (
    <section id="rsvp" className="px-6 py-8 text-center scroll-mt-0">
      <Reveal>
        <SectionTitle kicker="Attendance">RSVP / Kehadiran</SectionTitle>
        <form onSubmit={submit} className="space-y-3 mb-5 text-left">
          <input
            aria-label="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={nameLocked}
            placeholder="Nama"
            className="w-full bg-white/80 border gold-border rounded-xl px-4 py-2.5 text-sm outline-none shadow-sm read-only:opacity-70"
          />
          <div className="flex gap-3">
            {(["Hadir", "Tidak Hadir"] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setAttend(opt)}
                className={`flex-1 px-3 py-2 rounded-full text-sm border gold-border ${
                  attend === opt ? "btn-3d" : "bg-white/80 text-foreground/75"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {attend === "Hadir" && (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="opacity-85">Jumlah tamu (termasuk Anda)</span>
              <input
                type="number"
                inputMode="numeric"
                required
                min={1}
                max={10}
                value={guests || ""}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-20 bg-white/80 border gold-border rounded-xl px-3 py-2 text-sm text-center outline-none shadow-sm"
              />
            </label>
          )}
          <button
            type="submit"
            className="btn-3d w-full px-4 py-2 rounded-full text-sm font-medium"
          >
            KIRIM KONFIRMASI
          </button>
        </form>
        {list.length > 0 && (
          <p className="font-display mb-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            {list.length} Konfirmasi
          </p>
        )}
        <div className="space-y-2 text-left">
          {list.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-gold/20 bg-white/75 px-3 py-2 shadow-sm"
            >
              <Avatar name={r.name} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  r.attend === "Hadir" ? "bg-gold/15 text-gold-light" : "bg-foreground/10 text-foreground/70"
                }`}
              >
                {r.attend === "Hadir" ? `Hadir · ${r.guests} org` : "Tidak Hadir"}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ClosingSection({ photo }: { photo?: string }) {
  return (
    <section className="relative overflow-hidden text-center">
      {photo && <FullBleedPhoto src={photo} className="h-[70svh]" />}
      <Hearts className="absolute inset-x-0 bottom-0 h-[70%]" />
      <div className={`relative px-6 pb-12 ${photo ? "-mt-28" : "pt-10"}`}>
        <Reveal variant="zoom">
          <h2 className="font-script gold-shimmer py-1 text-6xl">Terima Kasih</h2>
        </Reveal>
        <FloralDivider className="mt-1 mb-4" />
        <Reveal>
          <p className="mb-6 text-sm opacity-80">
            Atas doa & ucapan bapak/ibu/saudara/i, Kami mengucapkan terima kasih.
          </p>
          <p className="font-display mb-1 text-base font-medium italic">Kami yang berbahagia,</p>
          <p className="font-script gold-shimmer mb-8 py-1 text-5xl">
            {couple.shortGroom} &amp; {couple.shortBride}
          </p>
        </Reveal>
        <p className="text-[11px] opacity-50">Website by : Feri</p>
      </div>
      <FloralCorner className="absolute -left-6 -bottom-6 w-32 h-32 opacity-70" />
      <FloralCorner
        flip
        className="absolute -right-6 -bottom-6 w-32 h-32 opacity-70"
      />
    </section>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.3 5 5.5 5c1.9 0 3.4 1 4.5 2.5C11.1 6 12.6 5 14.5 5 17.7 5 19.2 8.2 21.5 11.5 19 15.65 12 20 12 20Z" />
    </svg>
  );
}

function IconCalendar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
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

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
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

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "mempelai", label: "Mempelai", Icon: IconHeart },
  { id: "acara", label: "Acara", Icon: IconCalendar },
  { id: "love-story", label: "Love Story", Icon: IconBook },
  { id: "gallery", label: "Galeri", Icon: IconImage },
  { id: "ucapan", label: "Ucapan", Icon: IconEnvelope },
  { id: "rsvp", label: "RSVP", Icon: IconCheck },
];

/** Menu bawah; bagian yang sedang dibaca ditandai dengan warna emas dan titik. */
function BottomNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const { id } of NAV_ITEMS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 border-t gold-border flex justify-around py-2 z-40">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`relative flex flex-col items-center px-1 text-[11px] transition-colors duration-300 ${
            active === id ? "font-semibold text-gold" : "text-foreground/70"
          }`}
        >
          <span className="mb-1 text-gold-light">
            <Icon />
          </span>
          {label}
          <span
            className={`absolute -top-2 h-1 w-6 rounded-full bg-gold transition-opacity duration-300 ${
              active === id ? "opacity-100" : "opacity-0"
            }`}
          />
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
    setUrl(window.location.href);
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
        className="fixed top-16 right-4 z-40 w-10 h-10 rounded-full border gold-border bg-background/80 flex items-center justify-center text-gold-light text-xs"
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
            {/* eslint-disable-next-line @next/next/no-img-element -- QR eksternal, bukan aset statis */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
              alt="QR undangan"
              className="mx-auto mb-4"
              width={200}
              height={200}
            />
            <p className="text-xs opacity-70 mb-4 break-all max-w-[200px]">{url}</p>
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
