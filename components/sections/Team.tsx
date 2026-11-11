"use client";

import Image from "next/image";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";
import { team } from "@/content/config";
import { asset } from "@/lib/asset";

export default function Team() {
  const t = useTranslations("team");
  const root = useRef<HTMLElement>(null);
  const cols = team.length <= 2 ? "sm:grid-cols-2 max-w-3xl" : team.length === 3 ? "sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4";

  useGSAP(
    () => {
      gsap.from(gsap.utils.toArray("[data-member]", root.current), {
        y: 70,
        autoAlpha: 0,
        stagger: 0.15,
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current!.querySelector("[data-team]"), start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} />
        <div data-team className={`mt-14 grid gap-5 md:gap-8 ${cols}`}>
          {team.map((m, i) => (
            <figure data-member key={i} className="group">
              <div className="relative isolate aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-graphite [transform:translateZ(0)]">
                {m.photo ? (
                  <Image
                    src={asset(m.photo)}
                    alt={m.name}
                    fill
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    style={{
                      objectPosition: m.focus ?? "50% 20%",
                      scale: m.zoom ?? 1,
                      transformOrigin: m.focus ?? "50% 20%",
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center font-display text-6xl font-bold text-fg/10">
                    {m.initials}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
              </div>
              <figcaption className="mt-5">
                <div className="font-display text-2xl font-semibold">{m.name}</div>
                <div className="mt-1 text-[15px] text-mute">{m.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
