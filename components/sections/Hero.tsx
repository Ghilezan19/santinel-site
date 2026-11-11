"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onLoaded, scrollToId } from "@/lib/lenis";
import type { HeroSceneState } from "@/components/three/HeroScene";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

export default function Hero() {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);
  const state = useRef<HeroSceneState>({ intro: 0, scroll: 0, mx: 0, my: 0 });
  const [mobile, setMobile] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onMove = (e: PointerEvent) => {
      state.current.mx = (e.clientX / window.innerWidth) * 2 - 1;
      state.current.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const split = new SplitText(q("[data-title] > span"), { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 120 });
      gsap.set(q("[data-fade]"), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-hud]"), { autoAlpha: 0 });

      const off = onLoaded(() => {
        const tl = gsap.timeline({ delay: 0.25 });
        tl.to(state.current, { intro: 1, duration: 3.2, ease: "expo.out" }, 0)
          .to(q("[data-hud]"), { autoAlpha: 1, duration: 0.8, stagger: 0.08 }, 0.2)
          .to(split.chars, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.022 }, 0.35)
          .to(q("[data-fade]"), { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, 0.9);
      });

      gsap.to(state.current, {
        scroll: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q("[data-content]"), {
        yPercent: -30,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "20% top", end: "80% top", scrub: true },
      });
      gsap.to(q("[data-veil]"), {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "40% top", end: "bottom top", scrub: true },
      });

      return () => {
        off();
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        {reduce ? (
          <div className="hud-grid h-full w-full bg-[radial-gradient(ellipse_at_70%_40%,#1d2128,#07080a_70%)]" />
        ) : (
          <HeroScene
            state={state}
            mobile={mobile}
            labels={{ ok: t("labelOk"), harness: t("labelHarness"), pm: t("labelPm") }}
          />
        )}
      </div>

      {/* readability gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent md:via-ink/30" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div data-veil className="pointer-events-none absolute inset-0 bg-ink opacity-0" />

      {/* content */}
      <div
        data-content
        className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-20 pt-24 md:px-8 md:pb-24 md:pt-28"
      >
        <div
          data-fade
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-safety/30 bg-safety/5 px-3.5 py-1.5 text-[13px] font-medium text-safety"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-safety" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safety" />
          </span>
          {t("badge")}
        </div>
        <h1
          data-title
          className="font-display text-[13vw] font-bold leading-[0.9] tracking-[-0.035em] sm:text-[10vw] lg:text-[7.4vw] xl:text-[112px]"
        >
          <span className="block">{t("title1")}</span>
          <span className="block text-fg/50">{t("title2")}</span>
          <span className="block text-safety">{t("title3")}</span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p data-fade className="max-w-xl text-[15px] leading-relaxed text-mute md:text-base">
            {t("subtitle")}
          </p>
          <div data-fade className="flex flex-wrap gap-3">
            <button
              onClick={() => scrollToId("contact")}
              className="group relative cursor-pointer overflow-hidden rounded-full bg-safety px-7 py-4 text-sm font-semibold text-ink"
            >
              <span className="relative z-10">{t("ctaPrimary")} →</span>
              <span className="absolute inset-0 -translate-x-full bg-fg transition-transform duration-500 group-hover:translate-x-0" />
            </button>
            <button
              onClick={() => scrollToId("safety")}
              className="cursor-pointer rounded-full border border-fg/20 px-7 py-4 text-sm font-medium text-fg backdrop-blur transition-colors hover:border-fg/60"
            >
              {t("ctaSecondary")}
            </button>
          </div>
        </div>
      </div>

      <div
        data-hud
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-dim md:flex"
      >
        {t("scroll")}
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[drop_1.8s_ease-in-out_infinite] bg-safety" />
        </span>
      </div>
    </section>
  );
}
