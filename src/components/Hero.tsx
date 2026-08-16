import Link from "next/link";
import { StarField } from "./Design";

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{ background: "#120a26" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/assets/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(14, 10, 32, 0.9) 0%, rgba(46, 215, 159, 0.55) 50%, rgba(46, 215, 159, 0.75) 100%)",
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
                AI Journaling · Astrological Intelligence
              </span>
            </div>
            <h1
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(3.4rem, 7.5vw, 5.8rem)",
                fontWeight: 300,
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                color: "#f0ebe2",
                marginBottom: "1.5rem",
                transitionDelay: "80ms",
              }}
            >
              You&rsquo;ve been writing{" "}
              <em style={{ fontStyle: "italic", color: "#2ed79f" }}>
                in the dark.
              </em>
              <br />
              We brought the stars.
            </h1>
            <p
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "1.25rem",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "#958a9d",
                maxWidth: "480px",
                marginBottom: "2.5rem",
                transitionDelay: "160ms",
              }}
            >
              A subscription diary where every entry gets a thoughtful, personal
              response — written in the voice of someone who knows both your
              story and your chart.
            </p>
            <div className="reveal flex flex-wrap gap-4" style={{ transitionDelay: "240ms" }}>
              <Link href="/#pricing" className="btn-phosphor">
                Begin Your First Entry
              </Link>
              <Link href="/#how-it-works" className="btn-ghost">
                See How It Works
              </Link>
            </div>
            <div className="reveal mt-10 flex items-center gap-6" style={{ transitionDelay: "320ms" }}>
              <div className="flex -space-x-2">
                {["🌙", "⭐", "✨", "🔮"].map((emoji, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                    style={{ background: "#2b1c40", borderColor: "#120a26" }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.75rem",
                  color: "#766a83",
                  letterSpacing: "0.04em",
                }}
              >
                7-day free trial · No credit card noise, just the stars.
              </p>
            </div>
          </div>

          <div className="relative hidden justify-center lg:flex">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(31, 200, 150, 0.18) 0%, transparent 70%)",
                  transform: "scale(1.5)",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="Scorpio Rising"
                className="constellation-glow float relative z-10"
                style={{ width: "360px", height: "360px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, #211435)" }}
      />
    </section>
  );
}
