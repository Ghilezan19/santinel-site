"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { markLoaded } from "@/lib/lenis";
import { LogoMark } from "./Logo";

export default function Preloader() {
  const t = useTranslations("preloader");
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      const paths = q<SVGPathElement>("[data-draw]");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      if (reduce) {
        gsap.set(paths, { strokeDashoffset: 0 });
        gsap.to(root.current, {
          autoAlpha: 0,
          duration: 0.4,
          delay: 0.3,
          onStart: markLoaded,
          onComplete: () => setDone(true),
        });
        return;
      }

      const counter = { v: 0 };
      const num = q("[data-count]")[0];
      const tl = gsap.timeline({ onComplete: () => setDone(true) });

      tl.from(q("[data-mark]"), { scale: 0.6, opacity: 0, duration: 0.6, ease: "power3.out" })
        .to(paths, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut", stagger: 0.15 }, "<0.1")
        .to(
          counter,
          {
            v: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              if (num) num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          "<",
        )
        .from(q("[data-word] span"), { yPercent: 110, stagger: 0.04, duration: 0.6, ease: "power3.out" }, "<0.3")
        .to(q("[data-boot]"), { autoAlpha: 0, duration: 0.2 }, ">-0.1")
        .to(q("[data-ready]"), { autoAlpha: 1, duration: 0.2 })
        .to(q("[data-scanline]"), { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, "<")
        .add(() => markLoaded(), "+=0.15")
        .to(q("[data-content]"), { autoAlpha: 0, scale: 0.96, duration: 0.4, ease: "power2.in" }, "<")
        .to(q("[data-panel-top]"), { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "<0.1")
        .to(q("[data-panel-bottom]"), { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, "<");
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-hidden>
      <div data-panel-top className="absolute inset-x-0 top-0 h-1/2 bg-graphite" />
      <div data-panel-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-graphite" />
      <div className="hud-grid absolute inset-0 opacity-50" />
      <div data-content className="absolute inset-0 flex flex-col items-center justify-center">
        <div data-mark>
          <LogoMark className="h-20 w-20 text-fg md:h-24 md:w-24" />
        </div>
        <div data-word className="mt-6 flex overflow-hidden font-display text-2xl font-bold tracking-[0.4em] md:text-3xl">
          {"SANTINEL".split("").map((c, i) => (
            <span key={i} className="inline-block">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-10 flex w-64 flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-mute">
          <div className="relative h-px w-full bg-line">
            <div data-scanline className="absolute inset-0 origin-left scale-x-0 bg-safety" />
          </div>
          <div className="relative flex w-full justify-between">
            <span data-boot>{t("boot")}</span>
            <span data-ready className="invisible absolute left-0 text-safety">
              {t("ready")}
            </span>
            <span data-count className="text-fg">
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
