"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = { kicker: string; title: string; intro?: string; align?: "left" | "center"; accent?: "safety" | "air" };

export default function SectionHeader({ kicker, title, intro, align = "left", accent = "safety" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const split = new SplitText(q("h2"), { type: "lines,words", mask: "lines" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
      tl.from(q("[data-k]"), { autoAlpha: 0, x: -20, duration: 0.6, ease: "power3.out" })
        .from(split.lines, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.08 }, "<0.1")
        .from(q("[data-i]"), { autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out" }, "<0.4");
      return () => split.revert();
    },
    { scope: root },
  );
  const center = align === "center";
  return (
    <div ref={root} className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div
        data-k
        className={`mb-5 flex items-center gap-3 text-sm font-medium ${
          accent === "air" ? "text-air" : "text-safety"
        } ${center ? "justify-center" : ""}`}
      >
        <span className={`h-2 w-2 rounded-full ${accent === "air" ? "bg-air" : "bg-safety"}`} />
        {kicker}
      </div>
      <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] md:text-6xl">{title}</h2>
      {intro && (
        <p data-i className="mt-6 text-base leading-relaxed text-mute md:text-lg">
          {intro}
        </p>
      )}
    </div>
  );
}
