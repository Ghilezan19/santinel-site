"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";

const LIMIT = 50;
const MAX = 120;
const OK = "#3ddc84";
const WARN = "#ffc400";
const BAD = "#ff3b3b";
const AIR = "#2ee6c5";

// sparkline: calm → spike → recovery (viewBox 0 0 300 80, y inverted, 0..120 → 80..0)
const SPARK = (() => {
  const vals = [18, 20, 19, 22, 21, 26, 34, 47, 61, 74, 83, 87, 86, 79, 64, 48, 38, 31, 28, 27];
  return vals
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (vals.length - 1)) * 300).toFixed(1)} ${(80 - (v / MAX) * 80).toFixed(1)}`)
    .join(" ");
})();

function Sensor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="-34" stroke="#5a616b" strokeWidth="2" />
      <circle data-sensor-ring cx="0" cy="-40" r="14" fill="none" stroke={OK} strokeWidth="1.5" opacity="0.5">
        <animate attributeName="r" values="6;22" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle data-sensor cx="0" cy="-40" r="6" fill={OK} />
      <text x="10" y="-46" fontSize="10" fill="#8b929c" fontFamily="var(--font-jetbrains), monospace">
        {label}
      </text>
    </g>
  );
}

function Cannon({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  const sx = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <rect x="-22" y="-16" width="44" height="16" rx="3" fill="#3a424d" />
      <circle cx="-12" cy="0" r="5" fill="#15181d" />
      <circle cx="12" cy="0" r="5" fill="#15181d" />
      <rect x="-4" y="-30" width="8" height="14" fill="#5a616b" />
      <line x1="0" y1="-28" x2="20" y2="-44" stroke="#8b929c" strokeWidth="5" strokeLinecap="round" />
      <g data-spray>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M22 -46 Q ${70 + i * 14} ${-120 - i * 8} ${110 + i * 22} ${-40 + i * 6}`}
            stroke={AIR}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="6 14"
            style={{ animation: `spray 1.1s linear ${i * 0.14}s infinite` }}
            opacity="0.85"
          />
        ))}
      </g>
    </g>
  );
}

export default function AirModule() {
  const t = useTranslations("air");
  const steps = t.raw("steps") as { title: string; desc: string }[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const num = q("[data-num]")[0];
      const gauge = q("[data-gauge]")[0] as HTMLElement;
      const chip = q("[data-chip]")[0] as HTMLElement;
      const statuses = q("[data-status]");
      const sensors = q("[data-sensor]");
      const rings = q("[data-sensor-ring]");
      const stepEls = q("[data-astep]");
      const state = { v: 18, cannons: 0 };
      let lastStatus = -1;

      const render = () => {
        const v = state.v;
        num.textContent = String(Math.round(v));
        const pct = Math.min(v / MAX, 1) * 100;
        gauge.style.width = `${pct}%`;
        const color = state.cannons > 0.5 && v < LIMIT ? AIR : v >= LIMIT ? BAD : v > 32 ? WARN : OK;
        gauge.style.background = color;
        num.style.color = color;
        chip.style.borderColor = color;
        chip.style.color = color;
        sensors.forEach((s) => s.setAttribute("fill", color));
        rings.forEach((s) => s.setAttribute("stroke", color));
        const status = state.cannons > 0.5 && v < LIMIT ? 3 : state.cannons > 0.5 || v >= LIMIT ? 2 : v > 32 ? 1 : 0;
        if (status !== lastStatus) {
          lastStatus = status;
          statuses.forEach((el, i) => ((el as HTMLElement).style.display = i === status ? "inline" : "none"));
        }
      };
      render();

      gsap.set(q("[data-spray]"), { autoAlpha: 0 });
      gsap.set(q("[data-alert]"), { autoAlpha: 0, y: 10 });
      gsap.set(q("[data-dust]"), { opacity: 0.12, scale: 0.6, transformOrigin: "50% 100%" });
      const spark = q<SVGPathElement>("[data-spark]")[0];
      const len = spark.getTotalLength();
      gsap.set(spark, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(stepEls, { opacity: 0.3 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: q("[data-pin]")[0],
          start: "top top",
          end: "+=360%",
          pin: true,
          scrub: 0.6,
          snap: { snapTo: "labels", duration: { min: 0.2, max: 0.8 }, delay: 0.1 },
        },
      });

      tl.addLabel("a0")
        .to(stepEls[0], { opacity: 1, duration: 0.3 }, "a0")
        .to(spark, { strokeDashoffset: len * 0.72, duration: 1 }, "a0")
        .to(state, { v: 22, duration: 1, onUpdate: render }, "a0")
        .addLabel("a1", "+=0.2")
        .to(stepEls[0], { opacity: 0.3, duration: 0.3 }, "a1")
        .to(stepEls[1], { opacity: 1, duration: 0.3 }, "a1")
        .to(state, { v: 87, duration: 1.4, ease: "power1.in", onUpdate: render }, "a1")
        .to(spark, { strokeDashoffset: len * 0.4, duration: 1.4 }, "a1")
        .to(q("[data-dust]"), { opacity: 0.85, scale: 1.25, duration: 1.4 }, "a1")
        .to(q("[data-drift]"), { x: -140, duration: 1.4 }, "a1")
        .to(q("[data-alert]"), { autoAlpha: 1, y: 0, duration: 0.3 }, "a1+=1")
        .addLabel("a2", "+=0.3")
        .to(stepEls[1], { opacity: 0.3, duration: 0.3 }, "a2")
        .to(stepEls[2], { opacity: 1, duration: 0.3 }, "a2")
        .to(q("[data-spray]"), { autoAlpha: 1, duration: 0.3 }, "a2")
        .to(state, { cannons: 1, duration: 0.1, onUpdate: render }, "a2")
        .to(state, { v: 27, duration: 1.6, ease: "power2.out", onUpdate: render }, "a2+=0.2")
        .to(spark, { strokeDashoffset: 0, duration: 1.6 }, "a2+=0.2")
        .to(q("[data-dust]"), { opacity: 0.12, scale: 0.7, duration: 1.6 }, "a2+=0.2")
        .to(q("[data-drift]"), { x: 0, duration: 1.6 }, "a2+=0.2")
        .to(q("[data-alert]"), { autoAlpha: 0, duration: 0.3 }, "a2+=1.2")
        .addLabel("end", "+=0.3")
        .to({}, { duration: 0.3 });
    },
    { scope: root },
  );

  return (
    <section id="air" ref={root} className="relative bg-ink">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-40">
        <SectionHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} accent="air" />
      </div>

      <div data-pin className="relative flex h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(46,230,197,0.08),transparent_60%)]" />
        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-6 px-4 md:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {/* scene */}
          <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl border border-line bg-graphite">
            <svg viewBox="0 0 1000 600" className="absolute inset-0 h-full w-full" role="img" aria-label={t("title")}>
              <defs>
                <linearGradient id="airsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#0b0e12" />
                  <stop offset="1" stopColor="#161b21" />
                </linearGradient>
                <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="22" />
                </filter>
              </defs>
              <rect width="1000" height="600" fill="url(#airsky)" />

              {/* residential blocks (left) */}
              <g>
                <rect x="30" y="220" width="150" height="300" fill="#1a1f26" stroke="#262c34" />
                <rect x="190" y="290" width="110" height="230" fill="#171b21" stroke="#262c34" />
                {Array.from({ length: 8 }, (_, r) =>
                  [0, 1, 2, 3].map((c) => (
                    <rect
                      key={`r${r}c${c}`}
                      x={46 + c * 34}
                      y={238 + r * 34}
                      width="16"
                      height="18"
                      fill="#ffd27a"
                      opacity={(r * 3 + c) % 4 === 0 ? 0.08 : 0.32}
                    />
                  )),
                )}
                {Array.from({ length: 6 }, (_, r) =>
                  [0, 1, 2].map((c) => (
                    <rect key={`b${r}c${c}`} x={204 + c * 32} y={308 + r * 34} width="14" height="18" fill="#ffd27a" opacity={0.22} />
                  )),
                )}
                <text x="30" y="205" fontSize="12" fill="#8b929c" fontFamily="var(--font-jetbrains), monospace">
                  {t("residents").toUpperCase()}
                </text>
              </g>

              {/* school (right) */}
              <g>
                <rect x="790" y="360" width="180" height="160" fill="#1a1f26" stroke="#262c34" />
                <path d="M780 360 L880 310 L980 360 Z" fill="#20262d" />
                {[0, 1, 2, 3].map((c) => (
                  <rect key={c} x={806 + c * 42} y="392" width="24" height="30" fill="#ffd27a" opacity="0.25" />
                ))}
                <rect x="862" y="460" width="36" height="60" fill="#0f1216" />
                <text x="790" y="296" fontSize="12" fill="#8b929c" fontFamily="var(--font-jetbrains), monospace">
                  {t("school").toUpperCase()}
                </text>
              </g>

              {/* site */}
              <g>
                <rect x="360" y="380" width="380" height="140" fill="#14171b" />
                <path d="M360 520 V380 H740 V520" fill="none" stroke="#ffc400" strokeWidth="2" strokeDasharray="10 8" opacity="0.6" />
                {/* half-demolished structure */}
                <path d="M420 520 V420 L470 400 L500 430 L540 410 V520 Z" fill="#2a3038" />
                <path d="M600 520 V440 H680 V470 L660 490 V520 Z" fill="#242a31" />
                {/* excavator */}
                <g transform="translate(560 500)">
                  <rect x="-30" y="-10" width="60" height="16" rx="6" fill="#2b3139" />
                  <rect x="-22" y="-34" width="40" height="24" rx="3" fill="#ffc400" />
                  <path d="M16 -28 L52 -66 L78 -40" stroke="#ffc400" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <path d="M72 -44 L86 -30 L70 -26 Z" fill="#c99a00" />
                </g>
                <text x="370" y="372" fontSize="12" fill="#ffc400" fontFamily="var(--font-jetbrains), monospace">
                  {t("site").toUpperCase()}
                </text>
              </g>

              {/* dust cloud */}
              <g data-drift>
                <g data-dust filter="url(#blur)">
                  <circle cx="500" cy="420" r="90" fill="#a08b68" />
                  <circle cx="610" cy="400" r="80" fill="#8f7c5c" />
                  <circle cx="420" cy="380" r="70" fill="#9c8866" />
                  <circle cx="540" cy="330" r="80" fill="#8a7757" />
                  <circle cx="660" cy="350" r="60" fill="#968260" />
                </g>
              </g>

              {/* water cannons */}
              <Cannon x={380} y={520} />
              <Cannon x={720} y={520} flip />

              {/* sensors */}
              <Sensor x={360} y={380} label={`${t("sensor")} 1`} />
              <Sensor x={740} y={380} label={`${t("sensor")} 2`} />
              <Sensor x={550} y={380} label={`${t("sensor")} 3`} />

              <rect y="520" width="1000" height="80" fill="#101317" />
              <path d="M0 520 H1000" stroke="#262c34" />
            </svg>
            <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
            <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-fg md:left-5 md:top-4 md:text-[11px]">
              <span className="h-2 w-2 animate-blink rounded-full bg-air" /> SANTINEL AIR · LIVE
            </div>
            <div
              data-alert
              className="absolute bottom-3 left-3 right-3 rounded-lg border border-danger/50 bg-ink/85 p-2.5 font-mono text-[10px] uppercase tracking-wider text-danger backdrop-blur md:bottom-5 md:left-5 md:right-auto md:max-w-md md:p-3 md:text-xs"
            >
              ⚠ {t("alert")}
            </div>
          </div>

          {/* readout */}
          <div>
            <div className="rounded-2xl border border-line bg-graphite p-5 md:p-7">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-mute md:text-[11px]">
                {t("reading")}
                <span data-chip className="rounded-full border px-2.5 py-1 text-[10px]">
                  <span data-status>{t("status.good")}</span>
                  <span data-status>{t("status.rising")}</span>
                  <span data-status>{t("status.exceeded")}</span>
                  <span data-status>{t("status.recovering")}</span>
                </span>
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span data-num className="font-display text-6xl font-bold leading-none tracking-tight md:text-7xl">
                  18
                </span>
                <span className="mb-2 font-mono text-sm text-mute">µg/m³</span>
              </div>
              <div className="relative mt-5 h-2 rounded-full bg-line">
                <div data-gauge className="h-full rounded-full" style={{ width: "15%", background: OK }} />
                <div className="absolute -top-1.5 h-5 w-px bg-fg" style={{ left: `${(LIMIT / MAX) * 100}%` }} />
                <span
                  className="absolute top-4 -translate-x-1/2 font-mono text-[10px] text-mute"
                  style={{ left: `${(LIMIT / MAX) * 100}%` }}
                >
                  {t("threshold")} {LIMIT}
                </span>
              </div>
              <svg viewBox="0 0 300 80" className="mt-8 h-12 w-full" preserveAspectRatio="none">
                <line x1="0" x2="300" y1={80 - (LIMIT / MAX) * 80} y2={80 - (LIMIT / MAX) * 80} stroke="#ff3b3b" strokeDasharray="4 4" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
                <path data-spark d={SPARK} fill="none" stroke="#eef0f2" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <ol className="mt-5 hidden space-y-3 md:mt-6 lg:block">
              {steps.map((s, i) => (
                <li key={i} data-astep className="flex gap-4">
                  <span className="mt-1 font-mono text-xs text-air">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold md:text-xl">{s.title}</h3>
                    <p className="mt-1 hidden text-sm leading-relaxed text-mute sm:block [@media(max-height:780px)]:hidden">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
