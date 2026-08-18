import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Demo } from "@/components/Demo";
import { CoreLoop } from "@/components/CoreLoop";
import { MagicFeatures } from "@/components/MagicFeatures";
import { Story } from "@/components/Story";
import { Pricing } from "@/components/Pricing";
import { WaitlistCTA } from "@/components/WaitlistCTA";
import { Footer } from "@/components/Footer";
import { Marquee, Reveal, ConstellationThread } from "@/components/Design";

const MARQUEE = [
  "✦ Chart-Aware Responses",
  "✦ Memory Across Entries",
  "✦ Transit-Timed Check-ins",
  "✦ Crisis-Safe Design",
  "✦ Ironclad Privacy",
  "✦ 7-Day Free Trial",
];

const TESTIMONIALS = [
  {
    quote:
      "It doesn't just respond. It remembers. It's the first app that's ever made me feel like I have a witness.",
    sign: "Cancer Rising",
  },
  {
    quote:
      "I opened it at 2am during the worst week of my life and it knew exactly what to say. I don't know how.",
    sign: "Scorpio Sun",
  },
  {
    quote:
      "The transit check-ins are the reason I come back every day. It makes the hard stuff feel like it has a reason.",
    sign: "Virgo Moon",
  },
];

function WhyDifferent() {
  const layers = [
    { k: "Birth Chart", d: "Who you are" },
    { k: "Journal History", d: "What's actually happening" },
    { k: "Current Transits", d: "What's moving in the sky" },
    { k: "Memory", d: "What's happened before" },
  ];
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "#1b1133" }}>
      <div className="container-x relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
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
              Why it's different
            </span>
            <span className="bar" style={{ background: "#2ed79f", height: "1px", width: "2rem" }} />
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.12,
              color: "#f6f4f1",
            }}
          >
            Your horoscope doesn&rsquo;t know what happened yesterday.
            <br />
            <em style={{ fontStyle: "italic", color: "#2ed79f" }}>Scorpio Rising does.</em>
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {layers.map((l, i) => (
            <Reveal key={l.k} delay={i * 90}>
              <div className="card-vellum h-full p-5 text-center">
                <div
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.2rem",
                    fontWeight: 300,
                    color: "#f6f4f1",
                    marginBottom: "0.4rem",
                  }}
                >
                  {l.k}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.78rem",
                    color: "#8c8295",
                  }}
                >
                  {l.d}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="reveal mt-8 text-center text-sm" style={{ color: "#766a83" }}>
          Four layers, one reflection — built from your chart and your actual life.
        </p>
      </div>
    </section>
  );
}

function GetsToKnowYou() {
  const steps = [
    { d: "Day 1", t: "It understands your chart." },
    { d: "Day 7", t: "It starts recognizing recurring themes." },
    { d: "Day 30", t: "It sees patterns between your emotions, relationships, decisions and transits." },
    { d: "Month 6", t: "You have a searchable map of an entire chapter of your life." },
  ];
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "#15102b" }}>
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
              It gets to know you
            </span>
            <span className="bar" style={{ background: "#2ed79f", height: "1px", width: "2rem" }} />
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.12,
              color: "#f6f4f1",
            }}
          >
            The longer you stay,{" "}
            <em style={{ fontStyle: "italic", color: "#2ed79f" }}>the more it sees.</em>
          </h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {steps.map((s, i) => (
            <Reveal key={s.d} delay={i * 90}>
              <div className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div
                  className="shrink-0 rounded-full px-4 py-1"
                  style={{
                    background: "rgba(46, 215, 159, 0.12)",
                    border: "1px solid rgba(46, 215, 159, 0.35)",
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#2ed79f",
                  }}
                >
                  {s.d}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "1.15rem",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: "#cdc5b1",
                  }}
                >
                  {s.t}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Marquee items={MARQUEE} />
        <Demo />
        <WhyDifferent />
        <GetsToKnowYou />
        <CoreLoop />
        <MagicFeatures />
        <Story />
        <Pricing />
        <section className="relative overflow-hidden py-24" style={{ background: "#1b1133" }}>
          <div className="absolute left-8 top-8 hidden w-40 lg:block" style={{ transform: "rotate(15deg)" }}>
            <ConstellationThread />
          </div>
          <div className="container-x relative z-10">
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="card-vellum h-full p-7">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: "#2ed79f" }} />
                      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(46, 215, 159, 0.4), transparent)" }} />
                    </div>
                    <div
                      style={{
                        fontSize: "1.8rem",
                        color: "rgba(217, 178, 100, 0.45)",
                        fontFamily: "var(--font-display), serif",
                        lineHeight: 1,
                        marginBottom: "1rem",
                      }}
                    >
                      "
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-display), serif",
                        fontSize: "1.1rem",
                        fontStyle: "italic",
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: "#988da0",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {t.quote}
                    </p>
                    <div
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.68rem",
                        fontWeight: 500,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#2ed79f",
                      }}
                    >
                      — {t.sign}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <WaitlistCTA />
      </main>
      <Footer />
    </>
  );
}
