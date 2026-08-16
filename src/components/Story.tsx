import Link from "next/link";
import { Reveal, StarField, ConstellationThread } from "./Design";

export function Story() {
  return (
    <section
      id="our-story"
      className="relative overflow-hidden py-28"
      style={{ background: "oklch(0.14 0.05 285)" }}
    >
      <StarField count={28} />
      <div className="absolute right-12 top-20 hidden w-56 lg:block">
        <ConstellationThread className="opacity-25" />
      </div>
      <div className="container-x relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="section-label mb-5">
              <span className="bar" />
              <span style={{ color: "oklch(0.78 0.12 75)" }}>Our Story</span>
            </div>
            <h2
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                color: "oklch(0.94 0.02 85)",
                marginBottom: "2rem",
              }}
            >
              I built the thing that{" "}
              <em style={{ fontStyle: "italic", color: "oklch(0.78 0.12 75)" }}>
                got me through my divorce.
              </em>
            </h2>
            <Reveal delay={160}>
              {[
                "I'm Claire Redsun. I'm a Scorpio Rising — which means I was built for transformation, even when it doesn't feel that way. During my divorce, I needed something that could hold the weight of what I was going through without flinching.",
                "I journaled. I checked my chart. I looked for something that could connect the two — that could reflect me back to myself with both warmth and intelligence. That thing didn't exist. So I built it.",
                "Scorpio Rising isn't named after your sign. It's named after mine. But the app meets you in yours.",
              ].map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.15rem",
                    fontWeight: 300,
                    lineHeight: 1.75,
                    color: "oklch(0.64 0.04 285)",
                    marginBottom: i < 2 ? "1.25rem" : 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                  style={{ background: "oklch(0.20 0.065 278)", border: "1px solid oklch(1 0 0 / 10%)" }}
                >
                  ♏
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display), serif", fontSize: "1.1rem", fontWeight: 500, color: "oklch(0.94 0.02 85)" }}>
                    Claire Redsun
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.68rem",
                      letterSpacing: "0.12em",
                      color: "oklch(0.50 0.04 285)",
                      textTransform: "uppercase",
                    }}
                  >
                    Founder · Scorpio Rising
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl blur-2xl" style={{ background: "radial-gradient(circle, oklch(0.78 0.12 75 / 0.07) 0%, transparent 70%)" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/founder-mood.jpg"
                alt="Writing by candlelight"
                className="relative z-10 w-full rounded-sm object-cover"
                style={{ maxHeight: "480px", border: "1px solid oklch(1 0 0 / 8%)" }}
              />
              <div
                className="absolute bottom-6 left-6 right-6 rounded-sm p-5"
                style={{
                  background: "oklch(0.10 0.06 285 / 0.90)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderTop: "1px solid oklch(0.78 0.12 75 / 0.2)",
                }}
              >
                <div className="mb-3 w-32">
                  <ConstellationThread />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1rem",
                    fontStyle: "italic",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: "oklch(0.78 0.02 85)",
                  }}
                >
                  "The hard transit you're in is real, temporary, and meaningful."
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
