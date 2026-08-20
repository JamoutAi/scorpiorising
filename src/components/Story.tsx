import Link from "next/link";
import { Reveal, StarField, ConstellationThread } from "./Design";

export function Story() {
  return (
    <section
      id="our-story"
      className="relative overflow-hidden py-28"
      style={{ background: "#0c2a23" }}>
      <StarField count={28} />
      <div className="absolute right-12 top-20 hidden w-56 lg:block">
        <ConstellationThread className="opacity-25" />
      </div>
      <div className="container-x relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="section-label mb-5">
              <span className="bar" />
              <span style={{ color: "#d9b264" }}>Our Story</span>
            </div>
            <h2
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                color: "#f0ebe2",
                marginBottom: "2rem",
              }}
            >
              I built the thing that{" "}
              <em style={{ fontStyle: "italic", color: "#d9b264" }}>
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
                    color: "#8b7f94",
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
                  style={{ background: "#2b1c40", border: "1px solid rgba(255, 255, 255, 0.100)" }}
                >
                  ♏
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display), serif", fontSize: "1.1rem", fontWeight: 500, color: "#f0ebe2" }}>
                    Claire Redsun
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.68rem",
                      letterSpacing: "0.12em",
                      color: "#6c5a79",
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
              <div className="absolute -inset-4 rounded-2xl blur-2xl" style={{ background: "radial-gradient(circle, rgba(217, 178, 100, 0.07) 0%, transparent 70%)" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/founder-mood.jpg"
                alt="Writing by candlelight"
                className="relative z-10 w-full rounded-sm object-cover"
                style={{ maxHeight: "480px", border: "1px solid rgba(255, 255, 255, 0.080)" }}
              />
              <div
                className="absolute bottom-6 left-6 right-6 rounded-sm p-5"
                style={{
                  background: "rgba(46, 215, 159, 0.90)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255, 255, 255, 0.100)",
                  borderTop: "1px solid rgba(217, 178, 100, 0.2)",
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
                    color: "#cdc5b1",
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
