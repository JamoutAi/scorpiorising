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
      style={{ background: "#0c2a23" }}
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
              color: "#f0ebe2",
            }}
          >
            Write. Be seen.{" "}
            <em style={{ fontStyle: "italic", color: "#d9b264" }}>Rise.</em>
          </h2>
        </div>

        <div className="grid gap-8 lg:gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="card-vellum relative h-full p-8">
                <div
                  className="absolute right-5 top-5 h-3 w-3 rounded-full twinkle"
                  style={{ background: "rgba(46, 215, 159, 0.3)", border: "1px solid rgba(46, 215, 159, 0.5)" }}
                />
                <div
                  className="absolute right-3 top-3 select-none"
                  style={{ fontFamily: "var(--font-display), serif", fontSize: "4.5rem", fontWeight: 300, color: "rgba(255, 255, 255, 0.030)", lineHeight: 1 }}
                >
                  {step.number}
                </div>
                <div className="mb-5" style={{ fontSize: "1.4rem", color: "#2ed79f" }}>
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    color: "#f0ebe2",
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
                    color: "#7d7189",
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
