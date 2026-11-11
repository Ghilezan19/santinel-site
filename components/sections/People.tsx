"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";

const ICONS = [
  // worker with helmet
  <g key="0">
    <path d="M7 11a5 5 0 0 1 10 0" />
    <path d="M5.5 11h13" />
    <path d="M9 11.5a3 3 0 0 0 6 0" />
    <path d="M5 21c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
  </g>,
  // phone with check
  <g key="1">
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M10 11.5l1.6 1.6 3-3.2" />
  </g>,
  // home + leaf
  <g key="2">
    <path d="M4 11l8-7 8 7" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-4.5a2 2 0 0 1 4 0V20" />
  </g>,
  // building + heart
  <g key="3">
    <path d="M5 21V5l7-2v18M12 8h7v13" />
    <path d="M3 21h18" />
    <path d="M8 8h1M8 12h1M8 16h1M15 12h1M15 16h1" />
  </g>,
];

const TONES = ["#ffc400", "#ff9d00", "#2ee6c5", "#eef0f2"];

export default function People() {
  const t = useTranslations("people");
  const items = t.raw("items") as { who: string; text: string }[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(gsap.utils.toArray("[data-person]", root.current), {
        y: 60,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current!.querySelector("[data-people]"), start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-safety-deep/10 blur-[140px]" />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} />
        <div data-people className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <article
              data-person
              key={i}
              className="group relative flex flex-col rounded-3xl border border-line bg-graphite p-7 transition-colors duration-500 hover:border-white/15 md:p-8"
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                style={{ background: `${TONES[i]}1a`, color: TONES[i] }}
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[i]}
                </svg>
              </div>
              <h3 className="mt-8 font-display text-2xl font-semibold">{it.who}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mute">{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
