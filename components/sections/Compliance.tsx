"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";

const ICONS = [
  <path key="0" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4" />,
  <path key="1" d="M5 4h10l4 4v12H5zM15 4v4h4M8 12h8M8 16h5" />,
  <path key="2" d="M3 12h4l2-5 4 10 2-5h6" />,
  <path key="3" d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v2" />,
];

export default function Compliance() {
  const t = useTranslations("compliance");
  const items = t.raw("items") as { title: string; desc: string }[];
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.from(gsap.utils.toArray("[data-c]", root.current), {
        y: 50,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current!.querySelector("[data-grid]"), start: "top 85%", once: true },
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="relative bg-graphite py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} />
        <div data-grid className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div data-c key={i} className="bg-graphite p-7 md:p-8">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-safety" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[i]}
              </svg>
              <h3 className="mt-8 font-display text-xl font-semibold">{it.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mute">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
