import type { CSSProperties } from "react";

type MotifProps = { className?: string; style?: CSSProperties };

export function OndelOndel({ className = "", style }: MotifProps) {
  return (
    <svg viewBox="0 0 100 160" className={className} style={style} fill="none">
      <circle cx="50" cy="30" r="18" fill="#f4c9a0" stroke="var(--adat-red)" strokeWidth="2" />
      <path d="M32 22c0-10 8-18 18-18s18 8 18 18" stroke="var(--adat-red)" strokeWidth="3" fill="none" />
      <circle cx="42" cy="28" r="2.5" fill="var(--adat-red-dark)" />
      <circle cx="58" cy="28" r="2.5" fill="var(--adat-red-dark)" />
      <path d="M42 38c3 3 13 3 16 0" stroke="var(--adat-red)" strokeWidth="2" fill="none" />
      <path
        d="M28 48h44l8 70a10 10 0 0 1-10 12H30a10 10 0 0 1-10-12l8-70Z"
        fill="var(--gold)"
        stroke="var(--adat-red)"
        strokeWidth="2"
      />
      <path d="M28 48h44l4 20H24l4-20Z" fill="var(--gold-light)" opacity="0.6" />
      <path d="M50 48v82" stroke="var(--adat-red)" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function UmaLengge({ className = "", style }: MotifProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} style={style} fill="none">
      <path
        d="M60 6 108 70H12L60 6Z"
        fill="var(--gold-light)"
        stroke="var(--adat-red-dark)"
        strokeWidth="2.5"
      />
      <path d="M60 6 100 62" stroke="var(--adat-red-dark)" strokeWidth="1.2" opacity="0.5" />
      <path d="M60 6 20 62" stroke="var(--adat-red-dark)" strokeWidth="1.2" opacity="0.5" />
      <rect x="24" y="70" width="72" height="46" rx="2" fill="var(--gold)" stroke="var(--adat-red-dark)" strokeWidth="2.5" />
      <rect x="50" y="86" width="20" height="30" fill="var(--adat-red-dark)" opacity="0.8" />
      {[34, 84].map((x) => (
        <rect key={x} x={x} y="80" width="10" height="10" fill="#f4e6c9" stroke="var(--adat-red-dark)" strokeWidth="1" />
      ))}
    </svg>
  );
}
