/**
 * Stylised CCTV view of a construction site, drawn in SVG so every
 * detection box can be placed and animated precisely.
 * viewBox: 0 0 1200 675 — ground line at y = 600.
 */

type WorkerProps = {
  x: number;
  y: number;
  s?: number;
  helmet?: boolean;
  vest?: boolean;
  carry?: boolean;
  flip?: boolean;
  id?: string;
};

export function Worker({ x, y, s = 1, helmet = true, vest = true, carry = false, flip = false, id }: WorkerProps) {
  return (
    <g data-worker={id} transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* legs */}
      <path d="M-6 -28 L-8 0 M6 -28 L8 0" stroke="#2b3139" strokeWidth="7" strokeLinecap="round" />
      {/* torso */}
      <rect x="-10" y="-58" width="20" height="32" rx="6" fill="#3a424d" />
      {vest && (
        <g>
          <rect x="-10" y="-57" width="20" height="28" rx="5" fill="#ff8a00" />
          <rect x="-10" y="-44" width="20" height="3" fill="#e9eef2" opacity="0.9" />
          <rect x="-10" y="-37" width="20" height="3" fill="#e9eef2" opacity="0.9" />
        </g>
      )}
      {/* arms */}
      {carry ? (
        <path d="M-9 -52 L-16 -36 L-2 -30 M9 -52 L16 -36 L2 -30" stroke="#3a424d" strokeWidth="5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M-10 -52 L-14 -30 M10 -52 L14 -30" stroke="#3a424d" strokeWidth="5" strokeLinecap="round" />
      )}
      {carry && (
        <g>
          <rect x="-26" y="-40" width="52" height="7" rx="2" fill="#7a5a3a" />
          <rect x="-24" y="-47" width="48" height="7" rx="2" fill="#8b6b48" />
          <line x1="-30" y1="-34" x2="32" y2="-48" stroke="#9aa3ad" strokeWidth="2.5" />
          <line x1="-30" y1="-30" x2="32" y2="-44" stroke="#9aa3ad" strokeWidth="2.5" />
        </g>
      )}
      {/* head */}
      <circle cx="0" cy="-66" r="8" fill="#c99a78" />
      {helmet && <path d="M-10 -66 A10 10 0 0 1 10 -66 L12 -64 L-12 -64 Z" fill="#ffc400" />}
    </g>
  );
}

/** Detection box with corner brackets + label tag. */
export function DetectBox({
  x,
  y,
  w,
  h,
  label,
  tone = "bad",
  id,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: "bad" | "ok";
  id?: string;
}) {
  const c = tone === "bad" ? "#ff3b3b" : "#3ddc84";
  const k = 10;
  const tw = Math.max(label.length * 7.4 + 16, 40);
  return (
    <g data-box={id} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <rect x={x} y={y} width={w} height={h} fill={c} fillOpacity={tone === "bad" ? 0.08 : 0.04} stroke={c} strokeOpacity="0.35" strokeWidth="1" />
      <path
        d={`M${x} ${y + k} V${y} H${x + k} M${x + w - k} ${y} H${x + w} V${y + k} M${x + w} ${y + h - k} V${y + h} H${x + w - k} M${x + k} ${y + h} H${x} V${y + h - k}`}
        stroke={c}
        strokeWidth="2.5"
        fill="none"
      />
      <g transform={`translate(${x} ${y - 22})`}>
        <rect width={tw} height="18" fill={c} />
        <text x="8" y="13" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fontWeight="700" fill="#07080a" letterSpacing="0.5">
          {label}
        </text>
      </g>
    </g>
  );
}

export function SiteBackdrop() {
  const floors = [600, 510, 420, 330, 240, 150];
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0e12" />
          <stop offset="1" stopColor="#1a1f26" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23282f" />
          <stop offset="1" stopColor="#14171b" />
        </linearGradient>
        <pattern id="hazard" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="20" fill="#ff3b3b" fillOpacity="0.35" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#sky)" />
      {/* distant city */}
      <g fill="#12161b">
        <rect x="0" y="380" width="70" height="220" />
        <rect x="75" y="430" width="50" height="170" />
        <rect x="980" y="340" width="90" height="260" />
        <rect x="1075" y="400" width="60" height="200" />
        <rect x="1140" y="360" width="60" height="240" />
      </g>
      <g fill="#ffd27a" opacity="0.25">
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={992 + c * 26} y={360 + r * 40} width="10" height="14" />),
        )}
      </g>

      {/* crane */}
      <g stroke="#c99a00" strokeWidth="2" fill="none" opacity="0.9">
        <path d="M150 600 V70 M175 600 V70" />
        {Array.from({ length: 19 }, (_, i) => (
          <path key={i} d={`M150 ${600 - i * 28} L175 ${572 - i * 28}`} />
        ))}
        <path d="M60 70 H760 M60 58 H760 M162 70 L162 30 L760 64 M162 30 L60 64" />
        {Array.from({ length: 25 }, (_, i) => (
          <path key={`j${i}`} d={`M${60 + i * 28} 70 L${74 + i * 28} 58`} />
        ))}
        <rect x="64" y="72" width="44" height="26" fill="#3a3220" />
        <path d="M430 70 V300" stroke="#9aa3ad" strokeWidth="1.5" />
      </g>
      {/* suspended load */}
      <g>
        <rect x="395" y="300" width="70" height="16" fill="#6a4f33" />
        <rect x="398" y="288" width="64" height="12" fill="#7d6040" />
        <path d="M430 300 L400 288 M430 300 L460 288" stroke="#9aa3ad" strokeWidth="1.2" />
      </g>

      {/* building under construction */}
      <g>
        {floors.slice(0, -1).map((y, i) => (
          <g key={y}>
            <rect x="520" y={floors[i + 1]} width="380" height="10" fill="#2a3038" />
            {[520, 615, 710, 805, 890].map((x) => (
              <rect key={x} x={x} y={floors[i + 1]} width="10" height={y - floors[i + 1]} fill="#20262d" />
            ))}
          </g>
        ))}
        <rect x="520" y="140" width="10" height="10" fill="#20262d" />
        {/* rebar sticking out of top */}
        <path d="M525 150 V120 M620 150 V125 M715 150 V118 M810 150 V128 M895 150 V122" stroke="#5b636e" strokeWidth="2" />
        {/* safety netting */}
        <rect x="530" y="420" width="85" height="80" fill="#2ee6c5" opacity="0.04" />
      </g>

      {/* scaffolding */}
      <g stroke="#6b7380" strokeWidth="2">
        <path d="M908 600 V230 M960 600 V230" />
        {[510, 420, 330, 240].map((y) => (
          <g key={y}>
            <path d={`M904 ${y} H966`} strokeWidth="5" stroke="#8b6b48" />
            <path d={`M908 ${y + 90} L960 ${y}`} strokeOpacity="0.6" />
          </g>
        ))}
      </g>

      {/* ground */}
      <rect y="600" width="1200" height="75" fill="url(#ground)" />
      <path d="M0 600 H1200" stroke="#3a414b" />

      {/* fence + gate */}
      <g stroke="#4a525d" strokeWidth="3">
        {[8, 40, 72, 104, 136].map((x) => (
          <path key={x} d={`M${x} 600 V530`} />
        ))}
        <path d="M8 540 H136 M8 570 H136" strokeWidth="1.5" />
      </g>
      <text x="22" y="525" fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#6b7380">
        GATE 2
      </text>

      {/* materials pile */}
      <g>
        <rect x="180" y="578" width="80" height="22" fill="#5d4630" />
        <rect x="186" y="562" width="68" height="16" fill="#8f7d66" />
        <rect x="192" y="548" width="56" height="14" fill="#a39074" />
        <path d="M170 596 L280 586 M170 592 L280 582" stroke="#9aa3ad" strokeWidth="2.5" />
      </g>
    </g>
  );
}
