import { Reveal } from "./Design";

const ENTRY = `I keep thinking about quitting my job. I know I'm unhappy, but every time I get close to making a change I panic and convince myself I should just be grateful.`;

const RESPONSE = `You've written about this feeling three times since April. What's interesting is that the recurring theme isn't really work — it's permission.

With Saturn moving through your 10th house right now, questions around responsibility, career and identity may feel heavier than usual.

But something else keeps repeating in your journal: every time you imagine leaving, you immediately start explaining why you're not allowed to want something different.

Something to sit with: if you didn't have to justify leaving, what would you want?`;

export function Demo() {
  return (
    <section id="demo" className="relative overflow-hidden py-28" style={{ background: "#15102b" }}>
      <div className="container-x relative z-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="reveal mb-5 flex items-center justify-center gap-3">
            <span className="bar" style={{ background: "#2ed79f", height: "1px", width: "2rem" }} />
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
              See It In Action
            </span>
            <span className="bar" style={{ background: "#2ed79f", height: "1px", width: "2rem" }} />
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "#f6f4f1",
            }}
          >
            This is what a reflection{" "}
            <em style={{ fontStyle: "italic", color: "#2ed79f" }}>actually looks like.</em>
          </h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div
                className="mb-4 flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#8c8295",
                }}
              >
                You wrote
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display), serif",
                  fontSize: "1.2rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "#cdc5b1",
                }}
              >
                &ldquo;{ENTRY}&rdquo;
              </p>
            </div>
          </Reveal>

          <div className="flex justify-center">
            <div className="h-8 w-px" style={{ background: "linear-gradient(to bottom, rgba(46,215,159,0.5), transparent)" }} />
          </div>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-mint/30 bg-mint/10 p-7">
              <div
                className="mb-4 flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#2ed79f",
                }}
              >
                Scorpio Rising noticed
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display), serif",
                  fontSize: "1.1rem",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: "#f6f4f1",
                }}
              >
                {RESPONSE.split("\n\n").map((para, i) => (
                  <span key={i}>
                    {para}
                    {i < RESPONSE.split("\n\n").length - 1 && <span className="block h-4" />}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        </div>

        <p className="reveal mt-10 text-center text-sm" style={{ color: "#766a83" }}>
          This is a sample. Yours will know your chart, your transits, and your own story.
        </p>
      </div>
    </section>
  );
}
