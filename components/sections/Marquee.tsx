"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export default function Marquee({ tone = "safety" }: { tone?: "safety" | "air" }) {
  const t = useTranslations();
  const items = t.raw("marquee") as string[];
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const loop = gsap.to(track.current, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
      loop.totalTime(loop.duration() * 200); // room to play backwards
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
          gsap.to(loop, { timeScale: (self.direction || 1) * (1 + Math.abs(v)), duration: 0.3, overwrite: true });
          gsap.to(loop, { timeScale: self.direction || 1, duration: 1.2, delay: 0.3 });
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const bg = tone === "safety" ? "bg-safety text-ink" : "bg-air text-ink";
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden py-6">
    <div ref={root} className={`relative -rotate-1 scale-x-105 overflow-hidden py-4 md:py-5 ${bg}`}>
      <div ref={track} className="flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((it, i) => (
              <span
                key={`${k}-${i}`}
                className="flex items-center gap-6 px-6 font-display text-2xl font-bold uppercase tracking-tight md:text-4xl"
              >
                {it}
                <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-7 md:w-7" aria-hidden>
                  <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
