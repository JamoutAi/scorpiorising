import Link from "next/link";
import { ConstellationThread } from "./Design";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="py-12"
      style={{ background: "oklch(0.09 0.05 285)", borderTop: "1px solid oklch(1 0 0 / 7%)" }}
    >
      <div className="container-x">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Scorpio Rising" className="h-8 w-8 object-contain" />
            <span
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "1rem",
                fontStyle: "italic",
                fontWeight: 400,
                color: "oklch(0.55 0.04 285)",
              }}
            >
              Scorpio Rising
            </span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Support", href: "/support" },
              { label: "Our Story", href: "/story" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  color: "oklch(0.38 0.03 285)",
                  transition: "color 200ms ease",
                }}
                className="hover:text-[oklch(0.65_0.03_285)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: "0.65rem", color: "oklch(0.34 0.03 285)", letterSpacing: "0.05em" }}>
            © {year} Scorpio Rising
          </p>
        </div>
      </div>
    </footer>
  );
}
