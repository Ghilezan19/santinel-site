"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { site } from "@/content/config";
import Logo from "@/components/Logo";

type Status = "idle" | "sending" | "ok" | "error";

export default function Cta() {
  const t = useTranslations("cta");
  const tf = useTranslations("footer");
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const split = new SplitText(q("[data-big]"), { type: "lines,words", mask: "lines" });
      gsap.from(split.lines, {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: q("[data-big]")[0], start: "top 80%", once: true },
      });
      gsap.from(q("[data-form]"), {
        y: 60,
        autoAlpha: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: q("[data-form]")[0], start: "top 85%", once: true },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("_honey")) return; // bot filled the hidden field
    fd.delete("_honey");
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;

    if (!site.formEndpoint) {
      const body = Object.entries(data)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(t("mailSubject"))}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: `${t("mailSubject")} — ${data.company || data.name}`,
          _replyto: data.email,
          _template: "table",
          _captcha: "false",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      const ok = res.ok && String(json.success) !== "false";
      setStatus(ok ? "ok" : "error");
      if (ok) form.reset();
    } catch {
      setStatus("error");
    }
  };

  const input =
    "w-full rounded-xl border border-line bg-ink/60 px-4 py-3.5 text-[15px] text-fg placeholder:text-dim outline-none transition-colors focus:border-safety";

  return (
    <section id="contact" ref={root} className="relative overflow-hidden bg-ink pt-28 md:pt-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-safety/10 blur-[120px]" />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <h2 data-big className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] md:text-8xl">
              {t("title")}
            </h2>
            <p className="mt-8 max-w-md text-lg text-mute">{t("subtitle")}</p>
            <div className="mt-10 space-y-2 font-mono text-sm">
              <a href={`mailto:${site.contactEmail}`} className="block text-fg hover:text-safety">
                {site.contactEmail}
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block text-mute hover:text-fg">
                {site.phone}
              </a>
              <div className="text-dim">{site.city}</div>
            </div>
          </div>

          <form data-form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-line bg-graphite/80 p-6 backdrop-blur md:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder={t("name")} className={input} aria-label={t("name")} />
              <input name="company" required placeholder={t("company")} className={input} aria-label={t("company")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="email" type="email" required placeholder={t("email")} className={input} aria-label={t("email")} />
              <input name="sites" type="number" min={1} placeholder={t("sites")} className={input} aria-label={t("sites")} />
            </div>
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <textarea name="message" rows={4} placeholder={t("message")} className={`${input} resize-none`} aria-label={t("message")} />
            <button
              type="submit"
              disabled={status === "sending"}
              className="group relative w-full cursor-pointer overflow-hidden rounded-full bg-safety py-4 font-semibold text-ink disabled:opacity-60"
            >
              <span className="relative z-10">{status === "sending" ? t("sending") : `${t("submit")} →`}</span>
              <span className="absolute inset-0 -translate-x-full bg-fg transition-transform duration-500 group-hover:translate-x-0" />
            </button>
            {status === "ok" && <p className="text-center text-sm text-ok">{t("success")}</p>}
            {status === "error" && (
              <p className="text-center text-sm text-danger">
                {t("error")}{" "}
                <a href={`mailto:${site.contactEmail}`} className="underline">
                  {site.contactEmail}
                </a>
              </p>
            )}
          </form>
        </div>
      </div>

      <footer className="relative mt-28 border-t border-line md:mt-40">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-sm text-dim md:inline">— {tf("tagline")}</span>
          </div>
          <div className="text-sm text-dim">
            © {new Date().getFullYear()} {site.name}. {tf("rights")}
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none select-none overflow-hidden text-center font-display text-[22vw] font-bold leading-[0.75] tracking-[-0.06em] text-outline"
        >
          SANTINEL
        </div>
      </footer>
    </section>
  );
}
