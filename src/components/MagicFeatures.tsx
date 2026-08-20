import { Reveal, ConstellationThread, StarField } from "./Design";

const features = [
  {
    title: "Chart-aware voice",
    body: "Your natal chart and current transits shape the AI's tone, framing, and the prompts it offers. Not generic — made for you.",
  },
  {
    title: "Memory with intention",
    body: "It remembers the divorce, the goal you set in March, the name you'd rather not type again — and threads them through future reflections.",
  },
  {
    title: "Transit-timed check-ins",
    body: "Prompts align with your transits. \"This week's tension isn't just you — here's what's moving.\" That's the daily-return hook.",
  },
  {
    title: "Witness, not advice",
    body: "It reflects and holds space more than it instructs. The warmth of a wise friend who knows your chart — never a diagnosis.",
  },
];

export function MagicFeatures() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-28"
      style={{
        background: "#0c2a23",
        backgroundImage: "url(/assets/constellation-texture.jpg)",
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(21, 16, 43, 0.93), rgba(21, 16, 43, 0.90))",
        }}
      />
      <div className="absolute bottom-16 left-8 hidden w-48 lg:block" style={{ transform: "scaleX(-1)" }}>
        <ConstellationThread />
      </div>
      <StarField count={20} />
      <div className="container-x relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="reveal flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(31, 200, 150, 0.14) 0%, transparent 70%)", transform: "scale(1.25)" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/journal-mockup.jpg"
                alt="Scorpio Rising app interface"
                className="relative z-10 w-full rounded-sm shadow-2xl"
                style={{ maxWidth: "320px", border: "1px solid rgba(255, 255, 255, 0.100)" }}
              />
            </div>
          </div>

          <div>
            <div className="section-label mb-5">
              <span className="bar" />
              <span>What Makes It Magic</span>
            </div>
            <h2
              className="reveal"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                color: "#f0ebe2",
                marginBottom: "2.5rem",
              }}
            >
              A diary that knows{" "}
              <em style={{ fontStyle: "italic", color: "#d9b264" }}>your chart.</em>
            </h2>
            <div className="flex flex-col gap-6">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={160 + i * 80}>
                  <div className="flex gap-4">
                    <div
                      className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(46, 215, 159, 0.12)", border: "1px solid rgba(46, 215, 159, 0.4)" }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#2ed79f" }} />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontFamily: "var(--font-display), serif",
                          fontSize: "1.15rem",
                          fontWeight: 500,
                          color: "#f0ebe2",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {feature.title}
                      </h4>
                      <p
                        style={{
                          fontFamily: "var(--font-display), serif",
                          fontSize: "1rem",
                          fontWeight: 300,
                          lineHeight: 1.65,
                          color: "#7d7189",
                        }}
                      >
                        {feature.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
