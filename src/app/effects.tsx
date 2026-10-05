"use client";

import { useEffect, useRef } from "react";
import { useReveal } from "./useReveal";

/** Bungkus konten yang muncul saat discroll ke layar: naik, dari kiri/kanan (3D), atau membesar. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "zoom";
}) {
  const { ref, className: state } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${state} ${variant === "up" ? "" : `reveal-${variant}`} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/** Kartu yang miring 3D mengikuti jari/kursor, dengan pantulan cahaya. */
export function TiltCard({
  children,
  className = "",
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerUp={reset}
      onPointerCancel={reset}
      className={`tilt ${className}`}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}

/**
 * Gerak terikat scroll. `transform` menerima posisi induk elemen relatif ke tengah
 * layar (≈ -1 saat di bawah layar, 0 di tengah, 1 di atas) dan mengembalikan nilai
 * CSS transform. Posisi diambil dari induk supaya transform elemen tidak memengaruhi hitungan.
 */
export function useScrollMotion<T extends HTMLElement>(transform: (progress: number) => string) {
  const ref = useRef<T>(null);
  const transformRef = useRef(transform);

  useEffect(() => {
    transformRef.current = transform;
  });

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = parent.getBoundingClientRect();
      const progress = -(r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.transform = transformRef.current(progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/** Garis vertikal yang memanjang mengikuti scroll di dalam induknya (timeline). */
export function ScrollLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = "scaleY(1)";
      return;
    }
    const update = () => {
      const r = parent.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / r.height));
      el.style.transform = `scaleY(${t.toFixed(3)})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={`origin-top ${className}`}
      style={{ transform: "scaleY(0)" }}
      aria-hidden="true"
    />
  );
}

/** Bar tipis di atas layar yang terisi sesuai seberapa jauh undangan sudah dibaca. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-1/2 z-40 h-[3px] w-full max-w-md -translate-x-1/2"
      aria-hidden="true"
    >
      <div
        ref={ref}
        className="h-full origin-left bg-linear-to-r from-[#e8a07a] via-[#c76b39] to-[#8f4524]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

// Posisi deterministik supaya SSR dan klien sama.
const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 43 + 9) % 100}%`,
  size: `${2 + (i % 3)}px`,
  dur: `${16 + ((i * 5) % 12)}s`,
  delay: `-${((i * 2.9) % 22).toFixed(1)}s`,
  drift: `${(i % 2 ? 1 : -1) * (10 + ((i * 7) % 30))}px`,
}));

/** Kilau halus berwarna terakota yang melayang naik di atas seluruh halaman. */
export function Sparkles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {SPARKS.map((p, i) => (
        <span
          key={i}
          className="spark"
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
  );
}

const HEARTS = Array.from({ length: 9 }, (_, i) => ({
  left: `${(i * 29 + 8) % 92}%`,
  size: `${12 + ((i * 5) % 12)}px`,
  dur: `${7 + ((i * 3) % 5)}s`,
  delay: `-${((i * 1.9) % 9).toFixed(1)}s`,
  drift: `${(i % 2 ? 1 : -1) * (12 + ((i * 9) % 26))}px`,
}));

/** Hati yang melayang naik dari bawah bagian penutup. */
export function Hearts({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {HEARTS.map((p, i) => (
        <span
          key={i}
          className="heart-float"
          style={
            {
              left: p.left,
              "--size": p.size,
              "--dur": p.dur,
              "--delay": p.delay,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        >
          ♥
        </span>
      ))}
    </div>
  );
}
