import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
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

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Marquee items={MARQUEE} />
        <CoreLoop />
        <MagicFeatures />
        <Story />
        <Pricing />
        <section className="relative overflow-hidden py-24" style={{ background: "oklch(0.14 0.05 285)" }}>
          <div className="absolute left-8 top-8 hidden w-40 lg:block" style={{ transform: "rotate(15deg)" }}>
            <ConstellationThread />
          </div>
          <div className="container-x relative z-10">
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="card-vellum h-full p-7">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: "oklch(0.82 0.15 145)" }} />
                      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, oklch(0.82 0.15 145 / 0.4), transparent)" }} />
                    </div>
                    <div
                      style={{
                        fontSize: "1.8rem",
                        color: "oklch(0.78 0.12 75 / 0.45)",
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
                        color: "oklch(0.72 0.03 285)",
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
                        color: "oklch(0.82 0.15 145)",
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
