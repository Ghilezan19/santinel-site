type Props = { className?: string; withWord?: boolean };

/** SANTINEL mark: a shield-eye with a scanning pupil. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        data-draw
        d="M24 3 L42 10 V23 C42 34 34 42 24 45 C14 42 6 34 6 23 V10 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        data-draw
        d="M12 24 C16 17 20 15 24 15 C28 15 32 17 36 24 C32 31 28 33 24 33 C20 33 16 31 12 24 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="4.5" fill="#ffc400" />
    </svg>
  );
}

export default function Logo({ className = "", withWord = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-7 text-fg" />
      {withWord && (
        <span className="font-display text-[15px] font-bold tracking-[0.28em]">SANTINEL</span>
      )}
    </span>
  );
}
