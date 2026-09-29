import type { CSSProperties } from "react";

type MotifProps = { className?: string; style?: CSSProperties };

export function OndelOndel({ className = "", style }: MotifProps) {
  return (
    <svg viewBox="0 0 100 160" className={className} style={style} fill="none">
      <circle cx="50" cy="30" r="18" fill="#f4c9a0" stroke="#8a1c1c" strokeWidth="2" />
      <path d="M32 22c0-10 8-18 18-18s18 8 18 18" stroke="#8a1c1c" strokeWidth="3" fill="none" />
      <circle cx="42" cy="28" r="2.5" fill="#2a1a10" />
      <circle cx="58" cy="28" r="2.5" fill="#2a1a10" />
      <path d="M42 38c3 3 13 3 16 0" stroke="#8a1c1c" strokeWidth="2" fill="none" />
      <path
        d="M28 48h44l8 70a10 10 0 0 1-10 12H30a10 10 0 0 1-10-12l8-70Z"
        fill="#a6552a"
        stroke="#8a1c1c"
        strokeWidth="2"
      />
      <path d="M28 48h44l4 20H24l4-20Z" fill="#e8cf8a" opacity="0.9" />
      <path d="M50 48v82" stroke="#8a1c1c" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function UmaLengge({ className = "", style }: MotifProps) {
  return (
    <svg viewBox="0 0 120 130" className={className} style={style} fill="none">
      <path
        d="M60 6 108 70H12L60 6Z"
        fill="#7d3f1f"
        stroke="#4a0e0e"
        strokeWidth="2.5"
      />
      <path d="M60 6 100 62" stroke="#4a0e0e" strokeWidth="1.2" opacity="0.5" />
      <path d="M60 6 20 62" stroke="#4a0e0e" strokeWidth="1.2" opacity="0.5" />
      <rect x="24" y="70" width="72" height="46" rx="2" fill="#a6552a" stroke="#4a0e0e" strokeWidth="2.5" />
      <rect x="50" y="86" width="20" height="30" fill="#4a0e0e" opacity="0.8" />
      {[34, 84].map((x) => (
        <rect key={x} x={x} y="80" width="10" height="10" fill="#e8cf8a" stroke="#4a0e0e" strokeWidth="1" />
      ))}
    </svg>
  );
}
