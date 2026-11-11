"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { stats, statSources } from "@/content/config";

export default function Problem() {
  const t = useTranslations("problem");
  const root = useRef<HTMLElement>(null);
  const safetyItems = t.raw("safetyItems") as string[];
  const airItems = t.raw("airItems") as string[];

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const split = new SplitText(q("[data-statement]"), { type: "words" });
      gsap.set(split.words, { opacity: 0.12 });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: q("[data-pin]")[0], start: "top top", end: "+=140%", scrub: 0.5, pin: true },
          })
          .to(split.words, { opacity: 1, stagger: 0.1, ease: "none" })
          .to(q("[data-kick]"), { autoAlpha: 0.3 }, "<");
      });
      mm.add("(max-width: 767px)", () => {
        gsap.to(split.words, {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: q("[data-statement]")[0], start: "top 80%", end: "bottom 40%", scrub: 0.5 },
        });
      });

      q("[data-card]").forEach((card) => {
        gsap.from(card, {
          y: 60,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        });
        gsap.from(card.querySelectorAll("li"), {
          x: -20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 75%", once: true },
        });
      });

      gsap.from(q("[data-stat]"), {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: q("[data-stats]")[0], start: "top 85%", once: true },
      });

      const closing = new SplitText(q("[data-closing]"), { type: "chars", mask: "chars" });
      gsap.from(closing.chars, {
        yPercent: 100,
        stagger: 0.015,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: q("[data-closing]")[0], start: "top 85%", once: true },
      });

      return () => {
        split.revert();
        closing.revert();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section id="problem" ref={root} className="relative bg-ink">
      <div data-pin className="relative flex min-h-[100svh] items-center">
        <div className="hud-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-24 md:px-8">
          <div
            data-kick
            className="mb-10 flex items-center gap-3 text-sm font-medium text-safety"
          >
            <span className="h-2 w-2 rounded-full bg-safety" />
            {t("kicker")}
          </div>
          <p
            data-statement
            className="max-w-6xl font-display text-[8.5vw] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t("statement")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-28 md:px-8 md:pb-40">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <ProblemCard title={t("safetyTitle")} items={safetyItems} tone="safety" index="A" />
          <ProblemCard title={t("airTitle")} items={airItems} tone="air" index="B" />
        </div>

        <div data-stats className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:mt-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div data-stat key={s.key} className="bg-graphite p-6 md:p-8">
              <AnimatedCounter
                value={s.value}
                prefix={"prefix" in s ? s.prefix : ""}
                suffix={"suffix" in s ? s.suffix : ""}
                decimals={s.decimals}
                className="font-display text-4xl font-bold tracking-tight text-fg md:text-6xl"
              />
              <p className="mt-3 text-sm leading-snug text-mute">{t(`stats.${s.key}`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] leading-relaxed text-dim">
          {t("sourcesLabel")}: {statSources.join(" · ")}
        </p>

        <p
          data-closing
          className="mt-28 text-center font-display text-4xl font-bold tracking-[-0.03em] md:mt-40 md:text-7xl"
        >
          {t("closing")}
        </p>
      </div>
    </section>
  );
}

function ProblemCard({
  title,
  items,
  tone,
  index,
}: {
  title: string;
  items: string[];
  tone: "safety" | "air";
  index: string;
}) {
  const accent = tone === "safety" ? "text-safety" : "text-air";
  const dot = tone === "safety" ? "bg-safety" : "bg-air";
  return (
    <div
      data-card
      className="group relative overflow-hidden rounded-3xl border border-line bg-graphite p-7 md:p-10"
    >
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40 ${dot}`}
      />
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl font-semibold md:text-3xl">{title}</h3>
        <span className={`font-mono text-xs ${accent}`}>/{index}</span>
      </div>
      <ul className="mt-8 space-y-4">
        {items.map((it, i) => (
          <li key={i} className="flex gap-4 border-t border-line pt-4 text-[15px] text-fg/85">
            <span className={`mt-0.5 font-mono text-xs ${accent}`}>0{i + 1}</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
