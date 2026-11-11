"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string };

export default function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0, className = "" }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const o = { v: 0 };
    gsap.to(o, {
      v: value,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: { trigger: el.current, start: "top 85%", once: true },
      onUpdate: () => {
        if (el.current) el.current.textContent = prefix + o.v.toFixed(decimals) + suffix;
      },
    });
  });
  return (
    <span ref={el} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}
