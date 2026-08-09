import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Feel the magic. Build the habit.",
    features: [
      "Daily astrological framing",
      "A few reflective responses per week",
      "Your natal chart, set once",
    ],
    cta: "Open the diary free",
    highlight: false,
  },
  {
    name: "Mirror+",
    price: "$9.99",
    cadence: "/month",
    blurb: "Unlimited, depth, continuity.",
    features: [
      "Unlimited responsive entries",
      "Full chart-aware depth & memory",
      "Transit-timed check-ins",
      "Deeper weekly & monthly reflections",
    ],
    cta: "Begin your first entry",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-ink-deep py-24">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-mint">
          Simple Pricing
        </p>
        <h2 className="mt-4 text-center font-serif text-4xl font-bold text-paper">
          Start free. Go deeper when you&rsquo;re ready.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-3xl border p-8 backdrop-blur ${
                t.highlight
                  ? "border-mint/40 bg-white/5 shadow-[0_0_40px_rgba(185,245,224,0.12)]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <h3 className="font-serif text-2xl font-semibold text-paper">{t.name}</h3>
              <p className={`mt-1 text-sm ${t.highlight ? "text-mint/80" : "text-paper/60"}`}>
                {t.blurb}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-paper">{t.price}</span>
                <span className={`text-sm ${t.highlight ? "text-mint/70" : "text-paper/60"}`}>
                  {t.cadence}
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-paper/80">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-mint">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/reading"
                className={`mt-8 rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] transition ${
                  t.highlight
                    ? "bg-mint text-ink hover:bg-mint-bright"
                    : "border border-white/25 text-paper hover:bg-white/10"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-paper/50">
          Annual plans available (~$59–69/yr) to lift retention and pull cash
          forward. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
