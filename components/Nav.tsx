"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { gsap } from "@/lib/gsap";
import { getLenis, onLoaded, scrollToId } from "@/lib/lenis";
import Logo from "./Logo";

const LINKS = [
  ["problem", "problem"],
  ["safety", "safety"],
  ["air", "air"],
  ["how", "how"],
  ["demo", "demo"],
  ["pricing", "pricing"],
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const other = locale === "ro" ? "en" : "ro";
  const bar = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    gsap.set(bar.current, { yPercent: -120 });
    const off = onLoaded(() =>
      gsap.to(bar.current, { yPercent: 0, duration: 1, delay: 0.6, ease: "expo.out" }),
    );
    let last = 0;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const down = y > last && y > 400;
      if (down !== hidden) {
        hidden = down;
        gsap.to(bar.current, { yPercent: down ? -120 : 0, duration: 0.5, ease: "power3.out" });
      }
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      off();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-500 ${
          scrolled ? "border-b border-line bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:h-20 md:px-8">
          <button onClick={() => go("top")} aria-label="SANTINEL" className="cursor-pointer">
            <Logo />
          </button>
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map(([key, id]) => (
              <li key={key}>
                <button
                  onClick={() => go(id)}
                  className="cursor-pointer rounded-full px-3.5 py-2 text-[13px] text-mute transition-colors hover:text-fg"
                >
                  {t(key)}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              locale={other}
              className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-mute transition-colors hover:border-fg/30 hover:text-fg"
            >
              <span className={locale === "ro" ? "text-fg" : ""}>RO</span>
              <span className="mx-1 text-dim">/</span>
              <span className={locale === "en" ? "text-fg" : ""}>EN</span>
            </Link>
            <button
              onClick={() => go("contact")}
              className="hidden cursor-pointer rounded-full bg-safety px-5 py-2.5 text-[13px] font-semibold text-ink transition-transform hover:scale-[1.04] sm:block"
            >
              {t("cta")}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={open}
              className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line lg:hidden"
            >
              <span className={`absolute h-px w-4 bg-fg transition-transform ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-px w-4 bg-fg transition-transform ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-ink/95 backdrop-blur-xl transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex h-full flex-col justify-center gap-2 px-6">
          {LINKS.map(([key, id], i) => (
            <li key={key}>
              <button
                onClick={() => go(id)}
                className="cursor-pointer font-display text-4xl font-semibold text-fg"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span className="mr-3 font-mono text-sm text-safety">0{i + 1}</span>
                {t(key)}
              </button>
            </li>
          ))}
          <li className="mt-8">
            <button
              onClick={() => go("contact")}
              className="cursor-pointer rounded-full bg-safety px-6 py-3 font-semibold text-ink"
            >
              {t("cta")}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
