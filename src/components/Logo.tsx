import Link from "next/link";

export function Logo({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const ink = tone === "dark" ? "#17251f" : "#f4f1ea";
  const accent = tone === "dark" ? "#1aa37c" : "#1fc896";
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0"
        style={{ color: ink }}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <ellipse
          cx="12"
          cy="12"
          rx="11"
          ry="4"
          stroke="currentColor"
          strokeWidth="1.3"
          transform="rotate(-22 12 12)"
        />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
      <span className="font-serif text-lg font-bold tracking-tight" style={{ color: ink }}>
        SCORPIO <span style={{ color: accent }}>Rising</span>
      </span>
    </Link>
  );
}
