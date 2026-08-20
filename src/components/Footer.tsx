import Link from "next/link";
import { ConstellationThread } from "./Design";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="py-12"
      style={{ background: "#0c2a23", borderTop: "1px solid rgba(31, 200, 150, 0.12)" }}
    >
      <div className="container-x">
        <p
          className="mb-8 text-center"
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.68rem",
            letterSpacing: "0.04em",
            color: "#7d948b",
          }}
        >
          Scorpio Rising is reflection and support, not a crisis service. If you're in crisis, please visit our{" "}
          <Link href="/support" style={{ color: "#9bb3aa", textDecoration: "underline" }}>
            Support
          </Link>{" "}
          page for resources.
        </p>
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
                color: "#f4f1ea",
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
                  color: "#9bb3aa",
                  transition: "color 200ms ease",
                }}
                className="hover:text-[#1fc896]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: "0.65rem", color: "#7d948b", letterSpacing: "0.05em" }}>
            © {year} Scorpio Rising
          </p>
        </div>
      </div>
    </footer>
  );
}
