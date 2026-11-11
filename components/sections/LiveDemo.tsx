"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";
import { SiteBackdrop, Worker } from "@/components/ui/SiteScene";
import {
  CAMS,
  type DemoEvent,
  type EventType,
  makeEvent,
  nextPm,
  randomSafetyEvent,
  SCORE_PENALTY,
} from "@/lib/demoEngine";

const LIMIT = 50;
const HISTORY = 48;
const CAM_VIEWS = ["0 360 420 236", "480 140 520 292", "250 330 600 337", "560 300 560 315"];

function sevColor(s: DemoEvent["severity"]) {
  return s === "high" ? "#ff3b3b" : s === "medium" ? "#ffc400" : "#2ee6c5";
}

function ago(ts: number, now: number, nowLabel: string) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return nowLabel;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m`;
}

export default function LiveDemo() {
  const t = useTranslations("demo");
  const zones = t.raw("zones") as string[];
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [pm, setPm] = useState<number[]>(() => Array.from({ length: HISTORY }, (_, i) => 22 + Math.sin(i / 4) * 3));
  const [score, setScore] = useState(96);
  const [now, setNow] = useState(0);
  const target = useRef(24);
  const pmAlerted = useRef(false);
  const pmNow = useRef(22);
  const lastSafety = useRef(0);

  const push = useCallback((e: DemoEvent) => {
    setEvents((prev) => [e, ...prev].slice(0, 8));
    setScore((s) => Math.max(40, s - SCORE_PENALTY[e.severity]));
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setActive(en.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => {
      const ts = Date.now();
      setNow(ts);
      const v = nextPm(pmNow.current, target.current);
      pmNow.current = v;
      setPm((h) => [...h.slice(1), v]);
      if (v >= LIMIT && !pmAlerted.current) {
        pmAlerted.current = true;
        push(makeEvent("pmHigh", Math.round(v), 2));
        // the site manager reacts: water cannons bring it back down
        setTimeout(() => (target.current = 24), 5000);
      } else if (v < LIMIT - 8 && pmAlerted.current && target.current < LIMIT) {
        pmAlerted.current = false;
        push(makeEvent("pmOk", Math.round(v), 2));
      }
      setScore((s) => Math.min(98, s + 0.25));
      if (ts - lastSafety.current > 9000 && Math.random() < 0.18) {
        lastSafety.current = ts;
        push(randomSafetyEvent());
      }
    }, 1000);
    return () => clearInterval(id);
  }, [active, push]);

  const trigger = (type: EventType | "pm") => {
    lastSafety.current = Date.now();
    if (type === "pm") {
      target.current = 96;
      return;
    }
    push(makeEvent(type, undefined, type === "theft" ? 0 : type === "noHarness" ? 1 : undefined));
  };

  useGSAP(
    () => {
      gsap.from(root.current!.querySelector("[data-dash]"), {
        y: 80,
        autoAlpha: 0,
        rotateX: 12,
        transformPerspective: 1400,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current!.querySelector("[data-dash]"), start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  const current = pm[pm.length - 1];
  const pmColor = current >= LIMIT ? "#ff3b3b" : current > 35 ? "#ffc400" : "#3ddc84";
  const line = pm.map((v, i) => `${(i / (HISTORY - 1)) * 400},${120 - (Math.min(v, 120) / 120) * 120}`).join(" ");
  const roundedScore = Math.round(score);
  const ringLen = 2 * Math.PI * 42;
  const flashing = new Set(events.filter((e) => now - e.at < 3000 && e.type !== "pmOk").map((e) => e.cam));

  const evText = (e: DemoEvent) => ({
    title: t(`events.${e.type}.title`, { value: e.value ?? 0 }),
    body: t(`events.${e.type}.body`, { cam: e.cam, zone: zones[e.zone] ?? "" }),
  });

  return (
    <section id="demo" ref={root} className="relative bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

        <div className="mt-10 flex flex-wrap items-center gap-2 md:mt-14">
          <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mute">{t("simulate")} →</span>
          {(
            [
              ["noHelmet", "helmet"],
              ["noHarness", "harness"],
              ["pm", "pm"],
              ["theft", "theft"],
            ] as const
          ).map(([type, key]) => (
            <button
              key={key}
              onClick={() => trigger(type)}
              className="cursor-pointer rounded-full border border-line bg-graphite px-4 py-2.5 text-sm text-fg transition-all hover:-translate-y-0.5 hover:border-safety/60 hover:text-safety active:translate-y-0"
            >
              {t(`buttons.${key}`)}
            </button>
          ))}
        </div>

        <div data-dash className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* dashboard */}
          <div className="min-w-0 overflow-hidden rounded-3xl border border-line bg-graphite">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-danger/15 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-danger">
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" /> {t("live")}
                </span>
                <span className="text-sm font-medium">{t("siteName")}</span>
              </div>
              <span className="font-mono text-[11px] text-dim">SANTINEL / dashboard</span>
            </div>

            <div className="grid gap-px bg-line md:grid-cols-3">
              {/* score */}
              <div className="flex items-center gap-5 bg-graphite p-5 md:p-6">
                <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={roundedScore > 85 ? "#3ddc84" : roundedScore > 70 ? "#ffc400" : "#ff3b3b"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringLen}
                    strokeDashoffset={ringLen * (1 - roundedScore / 100)}
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1), stroke 0.5s" }}
                  />
                </svg>
                <div>
                  <div className="font-display text-4xl font-bold tabular-nums">{roundedScore}</div>
                  <div className="text-xs text-mute">{t("score")}</div>
                </div>
              </div>

              {/* PM chart */}
              <div className="bg-graphite p-5 md:col-span-2 md:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-mute">{t("air")}</span>
                  <span className="font-display text-2xl font-bold tabular-nums" style={{ color: pmColor }}>
                    {Math.round(current)} <span className="text-xs font-normal text-mute">µg/m³</span>
                  </span>
                </div>
                <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="mt-3 h-24 w-full">
                  <defs>
                    <linearGradient id="pmfill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor={pmColor} stopOpacity="0.35" />
                      <stop offset="1" stopColor={pmColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" x2="400" y1={120 - (LIMIT / 120) * 120} y2={120 - (LIMIT / 120) * 120} stroke="#ff3b3b" strokeDasharray="5 5" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
                  <polygon points={`0,120 ${line} 400,120`} fill="url(#pmfill)" />
                  <polyline points={line} fill="none" stroke={pmColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="mt-1 text-right font-mono text-[10px] text-danger/70">{t("threshold")}</div>
              </div>
            </div>

            <div className="grid gap-px bg-line md:grid-cols-[1.3fr_1fr]">
              {/* cameras */}
              <div className="bg-graphite p-5 md:p-6">
                <div className="mb-3 text-xs text-mute">{t("cameras")}</div>
                <div className="grid grid-cols-2 gap-2">
                  {CAMS.map((c, i) => (
                    <div
                      key={c}
                      className={`relative aspect-video overflow-hidden rounded-lg border transition-colors duration-300 ${
                        flashing.has(c) ? "border-danger shadow-[0_0_0_1px_#ff3b3b,0_0_24px_-4px_#ff3b3b]" : "border-line"
                      }`}
                    >
                      <svg viewBox={CAM_VIEWS[i]} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
                        <SiteBackdrop />
                        <Worker x={300} y={600} />
                        <Worker x={621} y={600} flip />
                        <Worker x={934} y={330} s={0.95} />
                        <Worker x={780} y={600} />
                        <Worker x={720} y={420} />
                      </svg>
                      <div className="scanlines absolute inset-0" />
                      {flashing.has(c) && <div className="absolute inset-0 animate-pulse bg-danger/15" />}
                      <span className="absolute left-1.5 top-1.5 font-mono text-[9px] tracking-wider text-fg/90">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* feed */}
              <div className="bg-graphite p-5 md:p-6">
                <div className="mb-3 text-xs text-mute">{t("alerts")}</div>
                <ul className="space-y-2">
                  {events.length === 0 && <li className="text-sm text-dim">{t("empty")}</li>}
                  {events.slice(0, 5).map((e) => {
                    const tx = evText(e);
                    return (
                      <li key={e.id} className="notif-in flex items-start gap-3 rounded-lg border border-line bg-ink/60 p-2.5">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: sevColor(e.severity) }} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium">{tx.title}</div>
                          <div className="truncate font-mono text-[10px] text-mute">{tx.body}</div>
                        </div>
                        <span className="font-mono text-[10px] text-dim">{ago(e.at, now, t("now"))}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* phone */}
          <div className="mx-auto w-full max-w-[300px]">
            <div className="relative aspect-[9/19] rounded-[44px] border border-white/15 bg-[#0b0c0e] p-2.5 shadow-[0_40px_120px_-30px_rgba(255,196,0,0.25)]">
              <div className="relative h-full overflow-hidden rounded-[36px] bg-[radial-gradient(ellipse_at_top,#2a2410,#0b0c0e_60%)]">
                <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
                <div className="px-5 pt-14 text-center">
                  <div className="font-display text-5xl font-semibold tabular-nums text-fg/90" suppressHydrationWarning>
                    {now ? new Date(now).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) : "08:42"}
                  </div>
                  <div className="mt-1 text-[11px] text-mute">{t("phoneTitle")}</div>
                </div>
                <div className="mt-6 space-y-2 px-3">
                  {events.slice(0, 4).map((e) => {
                    const tx = evText(e);
                    return (
                      <div key={e.id} className="notif-in rounded-2xl bg-white/10 p-3 backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                          <span className="grid h-5 w-5 place-items-center rounded-md bg-safety">
                            <span className="h-2 w-2 rounded-full bg-ink" />
                          </span>
                          <span className="text-[10px] font-semibold tracking-wider text-fg/80">SANTINEL</span>
                          <span className="ml-auto text-[10px] text-fg/50">{ago(e.at, now, t("now"))}</span>
                        </div>
                        <div className="mt-1.5 text-[12px] font-semibold leading-tight" style={{ color: e.severity === "info" ? "#2ee6c5" : undefined }}>
                          {tx.title}
                        </div>
                        <div className="text-[11px] leading-tight text-fg/60">{tx.body}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
