"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";
import { DetectBox, SiteBackdrop, Worker } from "@/components/ui/SiteScene";

type Step = { tag: string; title: string; desc: string; label: string; conf: string };

/** Box geometry per step (around the offending worker), in SVG units. */
const BOXES = [
  { x: 600, y: 516, w: 42, h: 90 }, // no helmet (ground)
  { x: 912, y: 246, w: 44, h: 90 }, // no harness (scaffold, 3rd level)
  { x: 758, y: 516, w: 44, h: 90 }, // no vest
  { x: 410, y: 516, w: 44, h: 90 }, // restricted zone
  { x: 30, y: 512, w: 76, h: 94 }, // theft at gate
];

export default function SafetyModule() {
  const t = useTranslations("safety");
  const steps = t.raw("steps") as Step[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const boxes = q("[data-box^='s']");
      const okBoxes = q("[data-box^='ok']");
      const texts = q("[data-step]");
      const toasts = q("[data-toast]");
      const bars = q("[data-bar]");

      gsap.set(boxes, { autoAlpha: 0, scale: 1.4 });
      gsap.set(okBoxes, { autoAlpha: 0 });
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 30 });
      gsap.set(toasts, { autoAlpha: 0, y: -12 });
      gsap.set(q("[data-night]"), { autoAlpha: 0 });
      gsap.set(q("[data-thief]"), { autoAlpha: 0, x: 120 });
      gsap.set(q("[data-zone]"), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.5 },
        scrollTrigger: {
          trigger: q("[data-pin]")[0],
          start: "top top",
          end: "+=520%",
          pin: true,
          scrub: 0.7,
          snap: { snapTo: "labels", duration: { min: 0.2, max: 0.7 }, delay: 0.1, ease: "power2.inOut" },
        },
      });

      tl.addLabel("intro")
        .to(okBoxes, { autoAlpha: 1, stagger: 0.1, duration: 0.4 })
        .to(q("[data-frame]"), { scale: 1, duration: 0.6 }, "<");

      steps.forEach((_, i) => {
        const label = `s${i}`;
        tl.addLabel(label, "+=0.6");
        if (i > 0) {
          tl.to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.35 }, label)
            .to(boxes[i - 1], { autoAlpha: 0.25, scale: 0.98, duration: 0.35 }, label)
            .to(toasts[i - 1], { autoAlpha: 0, y: -12, duration: 0.3 }, label);
        }
        if (i === 3) tl.to(q("[data-zone]"), { autoAlpha: 1, duration: 0.4 }, label);
        if (i === 4) {
          tl.to(q("[data-night]"), { autoAlpha: 1, duration: 0.6 }, label)
            .to(q("[data-day]"), { autoAlpha: 0, duration: 0.4 }, label)
            .to(okBoxes, { autoAlpha: 0, duration: 0.3 }, label)
            .to(boxes.slice(0, 4), { autoAlpha: 0, duration: 0.3 }, label)
            .to(q("[data-zone]"), { autoAlpha: 0, duration: 0.3 }, label)
            .to(q("[data-thief]"), { autoAlpha: 1, x: 0, duration: 0.8, ease: "none" }, label);
        }
        tl.to(texts[i], { autoAlpha: 1, y: 0 }, `${label}+=0.15`)
          .to(boxes[i], { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, `${label}+=0.2`)
          .to(toasts[i], { autoAlpha: 1, y: 0, duration: 0.4 }, `${label}+=0.45`)
          .to(bars[i], { scaleX: 1, duration: 0.6, ease: "none" }, label);
      });
      tl.addLabel("end", "+=0.6").to({}, { duration: 0.6 });
    },
    { scope: root },
  );

  return (
    <section id="safety" ref={root} className="relative bg-ink">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-40">
        <SectionHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />
      </div>

      <div data-pin className="relative flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-6 px-4 md:px-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          {/* CCTV frame */}
          <div
            data-frame
            className="relative aspect-video w-full scale-[0.97] overflow-hidden rounded-2xl border border-line bg-graphite shadow-[0_40px_120px_-30px_rgba(255,196,0,0.15)]"
          >
            <svg viewBox="0 0 1200 675" className="absolute inset-0 h-full w-full" role="img" aria-label={t("cam")}>
              <SiteBackdrop />
              {/* restricted zone */}
              <g data-zone>
                <path d="M350 600 L510 600 L540 640 L320 640 Z" fill="url(#hazard)" stroke="#ff3b3b" strokeWidth="2" strokeDasharray="8 6" />
                <path d="M430 316 L350 600 M430 316 L510 600" stroke="#ff3b3b" strokeOpacity="0.4" strokeDasharray="4 6" />
              </g>
              <g data-day>
                <Worker x={300} y={600} id="ok1" />
                <Worker x={720} y={420} id="ok2" flip />
                <Worker x={621} y={600} helmet={false} />
                <Worker x={934} y={330} s={0.95} />
                <Worker x={780} y={600} vest={false} flip />
                <Worker x={432} y={600} />
              </g>
              <g data-night>
                <rect width="1200" height="675" fill="#021a10" opacity="0.72" />
                <rect width="1200" height="675" fill="#3ddc84" opacity="0.06" style={{ mixBlendMode: "screen" }} />
              </g>
              <g data-thief>
                <Worker x={68} y={600} vest={false} helmet={false} carry flip />
              </g>
              <g data-day>
                <DetectBox id="ok-a" x={280} y={516} w={40} h={90} label="OK" tone="ok" />
                <DetectBox id="ok-b" x={700} y={336} w={40} h={90} label="OK" tone="ok" />
              </g>
              {BOXES.map((b, i) => (
                <DetectBox key={i} id={`s${i}`} {...b} label={`${steps[i].label} · ${steps[i].conf}`} />
              ))}
            </svg>

            {/* overlays */}
            <div className="scanlines pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-safety/[0.06] to-transparent" />
            <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-fg md:left-5 md:top-4 md:text-[11px]">
              <span className="h-2 w-2 animate-blink rounded-full bg-danger" />
              REC · {t("cam")}
            </div>
            <div className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.2em] text-mute md:bottom-4 md:left-5 md:text-[11px]">
              SANTINEL VISION v2 · 25 FPS
            </div>

            {/* alert toasts */}
            <div className="absolute right-2 top-2 w-[58%] max-w-xs md:right-4 md:top-4">
              {steps.map((s, i) => (
                <div
                  key={i}
                  data-toast
                  className="absolute right-0 top-0 w-full rounded-lg border border-danger/40 bg-ink/85 p-2 backdrop-blur md:p-3"
                >
                  <div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-wider text-danger md:text-[11px]">
                    <span>⚠</span> {s.label}
                    <span className="ml-auto text-mute">{i === 4 ? "02:47" : "0.8s"}</span>
                  </div>
                  <div className="mt-1 hidden text-[11px] text-fg/80 sm:block">
                    {t("alertSent")} · {i === 4 ? t("night") : t("cam")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* step text */}
          <div className="relative">
            <div className="mb-6 flex gap-1.5">
              {steps.map((_, i) => (
                <span key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line">
                  <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-safety" />
                </span>
              ))}
            </div>
            <div className="relative h-[200px] md:h-[260px]">
              {steps.map((s, i) => (
                <div key={i} data-step className="absolute inset-0">
                  <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-safety">
                    <span className="text-fg">0{i + 1}</span>
                    <span className="h-px w-6 bg-safety" />
                    {s.tag}
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-bold tracking-tight md:mt-5 md:text-5xl">{s.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mute md:mt-4 md:text-base">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
