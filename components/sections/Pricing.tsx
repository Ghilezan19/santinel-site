"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToId } from "@/lib/lenis";
import SectionHeader from "@/components/ui/SectionHeader";
import { pricing } from "@/content/config";

export default function Pricing() {
  const t = useTranslations("pricing");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(gsap.utils.toArray("[data-plan]", root.current), {
        y: 80,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current!.querySelector("[data-plans]"), start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="pricing" ref={root} className="relative bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />
        <div data-plans className="mt-14 grid gap-4 md:grid-cols-3">
          {pricing.plans.map((p) => {
            const features = t.raw(`plans.${p.id}.features`) as string[];
            return (
              <div
                data-plan
                key={p.id}
                className={`relative flex flex-col rounded-3xl border p-7 md:p-8 ${
                  p.highlighted ? "border-safety bg-safety text-ink" : "border-line bg-graphite"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-7 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-safety">
                    {t("recommended")}
                  </span>
                )}
                <h3 className="font-display text-3xl font-bold">{t(`plans.${p.id}.name`)}</h3>
                <p className={`mt-2 text-sm ${p.highlighted ? "text-ink/70" : "text-mute"}`}>{t(`plans.${p.id}.desc`)}</p>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-bold tracking-tight">
                    {p.price}
                    <span className="text-3xl">{pricing.currency}</span>
                  </span>
                  <span className={`text-sm ${p.highlighted ? "text-ink/60" : "text-mute"}`}>{t("perMonth")}</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <svg viewBox="0 0 16 16" className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlighted ? "text-ink" : "text-safety"}`} fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8.5l3 3 7-7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollToId("contact")}
                  className={`mt-10 cursor-pointer rounded-full py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    p.highlighted ? "bg-ink text-fg" : "border border-fg/20 text-fg hover:border-fg/50"
                  }`}
                >
                  {t("choose")} {t(`plans.${p.id}.name`)}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-dim">
          {t("hardware", {
            camera: pricing.hardware.camera,
            sensor: pricing.hardware.sensor,
            currency: pricing.currency,
          })}
        </p>
      </div>
    </section>
  );
}
