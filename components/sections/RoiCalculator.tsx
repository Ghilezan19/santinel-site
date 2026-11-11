"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { pricing, roiAssumptions as A } from "@/content/config";

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-mute">{label}</span>
        <span className="font-display text-2xl font-bold tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        className="slider mt-3"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--p" as string]: `${p}%` }}
      />
    </label>
  );
}

export default function RoiCalculator() {
  const t = useTranslations("roi");
  const locale = useLocale();
  const [workers, setWorkers] = useState(60);
  const [cameras, setCameras] = useState(8);
  const [months, setMonths] = useState(18);

  const years = months / 12;
  const incidents = workers * A.incidentRatePerWorkerYear * years * A.incidentReduction * A.avgIncidentCost;
  const fines = months * A.finesPerMonth * A.finesReduction;
  const theft = workers * A.theftPerWorkerMonth * months * A.theftReduction;
  const savings = incidents + fines + theft;
  const complete = pricing.plans.find((p) => p.id === "complete")!.price;
  const cost = complete * months + cameras * pricing.hardware.camera;
  const net = savings - cost;
  const ratio = savings / cost;

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-GB", { maximumFractionDigits: 0 }).format(Math.round(n)) +
    " " +
    pricing.currency;
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const formulas = t.raw("formulas") as string[];
  const fill = (s: string) =>
    s
      .replace("{rate}", String(A.incidentRatePerWorkerYear))
      .replace("{reduction}", pct(A.incidentReduction))
      .replace("{cost}", fmt(A.avgIncidentCost))
      .replace("{fines}", fmt(A.finesPerMonth))
      .replace("{finesReduction}", pct(A.finesReduction))
      .replace("{theft}", fmt(A.theftPerWorkerMonth))
      .replace("{theftReduction}", pct(A.theftReduction))
      .replace("{camera}", fmt(pricing.hardware.camera));

  const parts = [
    ["incidents", incidents, "#ff3b3b"],
    ["fines", fines, "#ffc400"],
    ["theft", theft, "#2ee6c5"],
  ] as const;

  return (
    <section className="relative bg-graphite py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

        <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-10 rounded-3xl border border-line bg-ink p-6 md:p-10">
            <Slider label={t("workers")} value={workers} min={10} max={300} step={5} onChange={setWorkers} />
            <Slider label={t("cameras")} value={cameras} min={2} max={40} onChange={setCameras} />
            <Slider label={t("months")} value={months} min={3} max={36} onChange={setMonths} />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-safety/25 bg-ink p-6 md:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-safety/20 blur-3xl" />
            <div className="relative">
              <div className="text-sm text-mute">{t("savings")}</div>
              <div className="mt-1 font-display text-5xl font-bold tracking-tight tabular-nums text-safety md:text-7xl">
                {fmt(savings)}
              </div>

              <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-line">
                {parts.map(([k, v, c]) => (
                  <div key={k} style={{ width: `${(v / savings) * 100}%`, background: c }} className="transition-[width] duration-500" />
                ))}
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {parts.map(([k, v, c]) => (
                  <li key={k} className="text-sm">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: c }} />
                    <span className="text-mute">{t(`breakdown.${k}`)}</span>
                    <div className="mt-0.5 font-semibold tabular-nums">{fmt(v)}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                <div className="bg-graphite p-4">
                  <div className="text-xs text-mute">{t("cost")}</div>
                  <div className="mt-1 font-semibold tabular-nums">{fmt(cost)}</div>
                </div>
                <div className="bg-graphite p-4">
                  <div className="text-xs text-mute">{t("net")}</div>
                  <div className={`mt-1 font-semibold tabular-nums ${net >= 0 ? "text-ok" : "text-danger"}`}>{fmt(net)}</div>
                </div>
                <div className="bg-graphite p-4">
                  <div className="text-xs text-mute">{t("roi")}</div>
                  <div className="mt-1 font-semibold tabular-nums">{ratio.toFixed(1)}×</div>
                </div>
              </div>

              <details className="group mt-6 text-sm">
                <summary className="cursor-pointer list-none font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-fg">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
                  {t("formulasTitle")}
                </summary>
                <ul className="mt-3 space-y-1.5 font-mono text-[11px] leading-relaxed text-dim">
                  {formulas.map((f, i) => (
                    <li key={i}>{fill(f)}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-dim">{t("disclaimer")}</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
