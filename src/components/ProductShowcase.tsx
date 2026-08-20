import { Reveal, ConstellationThread } from "./Design";

function AppPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card-cream flex h-full flex-col overflow-hidden">
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "rgba(23,37,31,0.08)", background: "#f1ece0" }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#7a756e",
          }}
        >
          {label}
        </span>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "#1fc896" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "#c5a46b" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "#9bb3aa" }} />
        </div>
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "#0c2a23", color: "#f4f1ea" }}>
      <ConstellationThread className="absolute bottom-20 right-10 hidden w-52 opacity-20 lg:block" />
      <div className="container-x relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="reveal mb-5 flex items-center justify-center gap-3">
            <span className="bar" style={{ background: "#1fc896", height: "1px", width: "2rem" }} />
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#1fc896",
              }}
            >
              Inside the app
            </span>
            <span className="bar" style={{ background: "#1fc896", height: "1px", width: "2rem" }} />
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.12,
              color: "#f4f1ea",
            }}
          >
            Your private journal,{" "}
            <em style={{ fontStyle: "italic", color: "#1fc896" }}>with depth underneath.</em>
          </h2>
          <p className="reveal mt-4 text-base" style={{ color: "#9bb3aa" }}>
            Five quiet spaces, one continuous understanding of your life.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today */}
          <Reveal delay={0} className="lg:col-span-2">
            <AppPanel label="Today">
              <p
                style={{
                  fontFamily: "var(--font-display), serif",
                  fontSize: "1.7rem",
                  fontWeight: 300,
                  color: "#17251f",
                  marginBottom: "0.25rem",
                }}
              >
                Good morning, Claire.
              </p>
              <p className="mb-4 text-sm" style={{ color: "#7a756e" }}>
                Here is your cosmic and personal snapshot.
              </p>
              <div className="mb-4 flex gap-2">
                {[
                  ["Sun", "Scorpio · 12°41'"],
                  ["Moon", "Virgo · 21°17'"],
                  ["Rising", "Cancer · 18°03'"],
                ].map(([k, v]) => (
                  <div key={k} className="flex-1 rounded-lg p-3" style={{ background: "#f1ece0" }}>
                    <div className="text-xs uppercase tracking-wide" style={{ color: "#1aa37c" }}>{k}</div>
                    <div className="text-sm" style={{ color: "#17251f", fontFamily: "var(--font-display), serif", fontSize: "1.05rem" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-4" style={{ background: "#0c2a23", color: "#f4f1ea" }}>
                <div className="text-xs uppercase tracking-wide" style={{ color: "#1fc896" }}>Your Current Chapter</div>
                <p className="mt-1 font-serif text-lg" style={{ fontFamily: "var(--font-display), serif", color: "#f4f1ea" }}>
                  Learning to choose yourself without needing permission.
                </p>
                <p className="mt-2 text-xs" style={{ color: "#9bb3aa" }}>
                  Seen across 11 entries · your goal to change careers · your Saturn transit.
                </p>
              </div>
            </AppPanel>
          </Reveal>

          {/* Patterns */}
          <Reveal delay={100}>
            <AppPanel label="Patterns">
              <ul className="space-y-3">
                {[
                  ["Boundaries", "12 entries · ↑ increasing"],
                  ["Work", "9 entries · ⇄ changing"],
                  ["Rest", "7 entries · ↻ recurring"],
                ].map(([k, v]) => (
                  <li key={k} className="border-b pb-2" style={{ borderColor: "rgba(23,37,31,0.07)" }}>
                    <div className="font-serif text-base" style={{ fontFamily: "var(--font-display), serif", color: "#17251f" }}>{k}</div>
                    <div className="text-xs" style={{ color: "#7a756e" }}>{v}</div>
                  </li>
                ))}
              </ul>
            </AppPanel>
          </Reveal>

          {/* Journal */}
          <Reveal delay={0}>
            <AppPanel label="Journal">
              <p className="text-sm" style={{ color: "#7a756e", marginBottom: "0.75rem" }}>
                What&rsquo;s on your mind?
              </p>
              <div className="rounded-lg p-3 text-sm italic" style={{ background: "#f1ece0", color: "#17251f" }}>
                &ldquo;I keep thinking about quitting my job…&rdquo;
              </div>
              <div className="mt-3 rounded-lg p-3 card-forest">
                <div className="text-xs uppercase tracking-wide" style={{ color: "#1fc896" }}>A Reflection</div>
                <p className="mt-1 text-sm" style={{ color: "#f4f1ea" }}>
                  You&rsquo;ve written about this three times since April. The theme isn&rsquo;t work — it&rsquo;s permission.
                </p>
              </div>
            </AppPanel>
          </Reveal>

          {/* My Story */}
          <Reveal delay={100}>
            <AppPanel label="My Story">
              <div className="space-y-3">
                {["March — Career frustration", "April — Leaving mentioned 6×", "June — Decision made"].map((t, i) => (
                  <div key={t} className="flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#1fc896" }} />
                    <span className="text-sm" style={{ color: "#17251f" }}>{t}</span>
                    {i < 2 && <div className="h-5 w-px" style={{ background: "rgba(23,37,31,0.12)" }} />}
                  </div>
                ))}
              </div>
            </AppPanel>
          </Reveal>

          {/* My Chart */}
          <Reveal delay={200}>
            <AppPanel label="My Chart">
              <div className="flex items-center justify-center py-3">
                <div className="relative h-28 w-28 rounded-full border" style={{ borderColor: "rgba(31,200,150,0.4)" }}>
                  <div className="absolute inset-3 rounded-full border" style={{ borderColor: "rgba(197,164,107,0.4)" }} />
                  <div className="absolute inset-0 flex items-center justify-center text-center text-xs" style={{ color: "#1aa37c" }}>
                    Sun · Moon · Rising
                  </div>
                </div>
                <div className="absolute" />
              </div>
              <p className="text-center text-xs" style={{ color: "#7a756e" }}>
                Tap a planet to explore its meaning.
              </p>
            </AppPanel>
          </Reveal>

          {/* Ask */}
          <Reveal delay={300} className="lg:col-span-3">
            <div className="card-forest flex flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="text-xs uppercase tracking-wide" style={{ color: "#1fc896" }}>Ask Scorpio Rising</div>
              <p className="font-serif text-lg" style={{ fontFamily: "var(--font-display), serif", color: "#f4f1ea" }}>
                &ldquo;When did I first start talking about quitting my job?&rdquo;
              </p>
              <p className="text-xs" style={{ color: "#9bb3aa" }}>
                Talk to your history — patterns, people, and moments across your whole story.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
