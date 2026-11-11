"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";

const ICONS = [
  // camera + sensor
  <path key="0" d="M4 9h11l3-3v12l-3-3H4zM20 8v8M23 6v12" />,
  // chip
  <path key="1" d="M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />,
  // cloud
  <path key="2" d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.5 4.25 4.25 0 0 0 7 18z" />,
  // phone + bell
  <path key="3" d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2M12 7.5a2.5 2.5 0 0 1 2.5 2.5v2l1 1.5h-7l1-1.5v-2A2.5 2.5 0 0 1 12 7.5z" />,
];

export default function Pipeline() {
  const t = useTranslations("pipeline");
  const nodes = t.raw("nodes") as { title: string; desc: string }[];
  const metrics = t.raw("metrics") as { value: string; label: string }[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: q("[data-flow]")[0], start: "top 75%", end: "bottom 45%", scrub: 0.6 },
      });
      q("[data-node]").forEach((n, i) => {
        tl.from(n, { autoAlpha: 0, y: 40, duration: 0.5 }, i * 0.6);
        const link = q("[data-link]")[i];
        if (link) tl.fromTo(link, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 0.5, ease: "none" }, i * 0.6 + 0.3);
      });
      gsap.from(q("[data-metric]"), {
        autoAlpha: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: q("[data-metrics]")[0], start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="how" ref={root} className="relative overflow-hidden bg-graphite py-28 md:py-40">
      <div className="hud-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} />

        <div data-flow className="mt-16 flex flex-col gap-0 md:mt-24 lg:flex-row lg:items-stretch">
          {nodes.map((n, i) => (
            <div key={i} className="flex flex-col lg:flex-1 lg:flex-row lg:items-center">
              <div
                data-node
                className="group relative flex-1 rounded-2xl border border-line bg-ink/80 p-6 backdrop-blur transition-colors hover:border-safety/40 md:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-safety/30 bg-safety/10 text-safety">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[i]}
                    </svg>
                  </div>
                  <span className="font-mono text-xs text-dim">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{n.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{n.desc}</p>
              </div>
              {i < nodes.length - 1 && (
                <div className="relative flex h-10 w-full items-center justify-center lg:h-auto lg:w-10">
                  <div
                    data-link
                    className="relative h-full w-px origin-top overflow-hidden bg-safety/50 lg:h-px lg:w-full lg:origin-left"
                  >
                    <span className="absolute left-0 top-0 h-3 w-px animate-[drop_1.2s_linear_infinite] bg-safety lg:hidden" />
                    <span className="absolute left-0 top-0 hidden h-px w-3 animate-[slide_1.2s_linear_infinite] bg-fg lg:block" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div data-metrics className="mt-20 grid grid-cols-2 gap-y-10 border-t border-line pt-12 md:mt-28 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <div data-metric key={i}>
              <div className="font-display text-5xl font-bold tracking-tight text-safety md:text-7xl">{m.value}</div>
              <div className="mt-2 max-w-[14rem] text-sm text-mute">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
