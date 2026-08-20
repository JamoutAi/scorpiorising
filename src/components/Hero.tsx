import Link from "next/link";
import { StarField } from "./Design";

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{ background: "#0c2a23" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/assets/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(12,42,35,0.4) 0%, rgba(8,32,26,0.85) 55%, rgba(8,32,26,0.95) 100%)",
        }}
      />
      <div className="absolute inset-0 ridge-texture" style={{ zIndex: 1 }} />
      <StarField count={60} />

      <div className="container-x relative z-10 py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="reveal mb-8 flex items-center gap-3">
              <div className="h-px w-10" style={{ background: "#2ed79f" }} />
              <span
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#2ed79f",
                }}
              >
                Your chart + your story
              </span>
            </div>
            <h1
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "#f4f1ea",
                marginBottom: "1.5rem",
                transitionDelay: "80ms",
              }}
            >
              Your birth chart knows who you are.
              <br />
              Your journal knows what you&rsquo;re going through.
              <br />
              <em style={{ fontStyle: "italic", color: "#2ed79f" }}>
                Scorpio Rising connects the two.
              </em>
            </h1>
            <p
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "1.25rem",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "#c9d3cd",
                maxWidth: "480px",
                marginBottom: "2.5rem",
                transitionDelay: "160ms",
              }}
            >
              A private AI journal that remembers your story, understands your
              birth chart, follows your current transits, and helps you see
              patterns in your life over time.
            </p>
            <div className="reveal flex flex-wrap gap-4" style={{ transitionDelay: "240ms" }}>
              <Link href="/signup?redir=/profile" className="btn-phosphor">
                Try Your First Reflection Free
              </Link>
              <Link href="/#demo" className="btn-ghost">
                See It In Action
              </Link>
            </div>
            <div className="reveal mt-10 flex items-center gap-6" style={{ transitionDelay: "320ms" }}>
              <p
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.75rem",
                  color: "#9bb3aa",
                  letterSpacing: "0.04em",
                }}
              >
                No credit card required. Experience the magic first.
              </p>
            </div>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="relative flex h-[520px] w-[520px] items-center justify-center">
              {/* Pulsating rings */}
              <span className="pulse-ring" style={{ width: "440px", height: "440px" }} />
              <span className="pulse-ring delay" style={{ width: "440px", height: "440px" }} />
              {/* Soft breathing halo */}
              <div
                className="breathe absolute rounded-full"
                style={{
                  width: "480px",
                  height: "480px",
                  background:
                    "radial-gradient(circle, rgba(31, 200, 150, 0.16) 0%, rgba(46, 215, 159, 0.05) 45%, transparent 70%)",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="Scorpio Rising"
                className="constellation-glow float relative z-10"
                style={{ width: "440px", height: "440px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, #08201a)" }}
      />
    </section>
  );
}
