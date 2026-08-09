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
    <section id="pricing" className="bg-mist py-24">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-ink-soft">
          Simple Pricing
        </p>
        <h2 className="mt-4 text-center font-serif text-4xl font-bold text-ink">
          Start free. Go deeper when you&rsquo;re ready.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                t.highlight
                  ? "border-ink bg-ink text-paper shadow-lg"
                  : "border-ink/10 bg-paper text-ink"
              }`}
            >
              <h3 className="font-serif text-2xl font-semibold">{t.name}</h3>
              <p className={`mt-1 text-sm ${t.highlight ? "text-paper/70" : "text-ink/60"}`}>
                {t.blurb}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold">{t.price}</span>
                <span className={`text-sm ${t.highlight ? "text-paper/60" : "text-ink/60"}`}>
                  {t.cadence}
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className={t.highlight ? "text-mint" : "text-ink-soft"}>✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/reading"
                className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
                  t.highlight
                    ? "bg-mint text-ink hover:bg-mint-bright"
                    : "bg-ink text-paper hover:bg-ink-soft"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink/50">
          Annual plans available (~$59–69/yr) to lift retention and pull cash
          forward. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
