export function FloralCorner({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none select-none ${
        flip ? "scale-x-[-1]" : ""
      } ${className}`}
      fill="none"
    >
      <defs>
        <linearGradient id="floralGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c76b39" />
          <stop offset="60%" stopColor="#a6552a" />
          <stop offset="100%" stopColor="#7d3f1f" />
        </linearGradient>
      </defs>
      <path
        d="M10 190C10 120 40 60 100 30C70 70 60 120 80 170"
        stroke="url(#floralGold)"
        strokeWidth="2"
      />
      <path
        d="M20 180C40 140 60 100 110 70"
        stroke="url(#floralGold)"
        strokeWidth="1.5"
      />
      {[
        [60, 150],
        [90, 110],
        [120, 75],
        [45, 175],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-7"
              rx="4"
              ry="7"
              fill="url(#floralGold)"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="3" fill="#c76b39" />
        </g>
      ))}
    </svg>
  );
}
