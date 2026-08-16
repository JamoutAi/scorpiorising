import { Reveal, StarField, ConstellationThread } from "./Design";

const steps = [
  {
    number: "01",
    icon: "◎",
    title: "Share your chart",
    body: "Enter your birth date, time, and place. We build your natal chart — the persistent, personal lens that shapes everything that follows.",
  },
  {
    number: "02",
    icon: "✦",
    title: "Write freely",
    body: "Open the diary and write what you can't say out loud. No prompts required. No judgment. Just you and the page.",
  },
  {
    number: "03",
    icon: "◐",
    title: "Receive your reflection",
    body: "Your entry comes back as a thoughtful response — shaped by your chart, today's transits, and everything you've shared before. It sees you.",
  },
];

export function CoreLoop() {
  return (
    <section
      id="how-it-works"
      className="ridge-texture relative overflow-hidden py-28"
      style={{ background: "oklch(0.14 0.05 285)" }}
    >
      <StarField count={22} />
      <div className="absolute right-8 top-12 hidden w-48 lg:block">
        <ConstellationThread />
      </div>
      <div className="container-x relative z-10">
        <div className="mb-20 max-w-xl">
          <div className="section-label mb-5">
            <span className="bar" />
            <span>The Core Loop</span>
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "oklch(0.94 0.02 85)",
            }}
          >
            Write. Be seen.{" "}
            <em style={{ fontStyle: "italic", color: "oklch(0.78 0.12 75)" }}>Rise.</em>
          </h2>
        </div>

        <div className="grid gap-8 lg:gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="card-vellum relative h-full p-8">
                <div
                  className="absolute right-5 top-5 h-3 w-3 rounded-full twinkle"
                  style={{ background: "oklch(0.82 0.15 145 / 0.3)", border: "1px solid oklch(0.82 0.15 145 / 0.5)" }}
                />
                <div
                  className="absolute right-3 top-3 select-none"
                  style={{ fontFamily: "var(--font-display), serif", fontSize: "4.5rem", fontWeight: 300, color: "oklch(1 0 0 / 3%)", lineHeight: 1 }}
                >
                  {step.number}
                </div>
                <div className="mb-5" style={{ fontSize: "1.4rem", color: "oklch(0.82 0.15 145)" }}>
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    color: "oklch(0.94 0.02 85)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.05rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "oklch(0.58 0.04 285)",
                  }}
                >
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
