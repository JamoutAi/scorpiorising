import Link from "next/link";

// 🔧 EDIT PRICES HERE. The Stripe checkout links below already include the
// 7-day free trial you set up. Put the real monthly prices in the `price`
// fields (these are display-only; the actual charge is handled by Stripe).
const tiers = [
  {
    name: "Mirror",
    price: "$—", // ← your Mirror monthly price (e.g. "$9.99")
    cadence: "/month",
    blurb: "Your daily reflection, chart-aware.",
    features: [
      "Your natal chart, set once",
      "Daily astrological framing",
      "Reflective responses to your entries",
      "Transit-timed check-ins",
    ],
    cta: "Start 7-day free trial",
    stripe: "https://buy.stripe.com/eVq6oHaLmgfLani32P4Ni03",
    highlight: false,
  },
  {
    name: "Mirror+",
    price: "$—", // ← your Mirror+ monthly price (e.g. "$19.99")
    cadence: "/month",
    blurb: "Unlimited depth, memory, and continuity.",
    features: [
      "Everything in Mirror",
      "Unlimited responsive entries",
      "Full chart-aware depth & memory",
      "Deeper weekly & monthly reflections",
    ],
    cta: "Start 7-day free trial",
    stripe: "https://buy.stripe.com/6oU28rg5GaVr8fafPB4Ni02",
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
          Start free for 7 days. Go deeper when you&rsquo;re ready.
        </h2>
        <p className="mt-3 text-center text-sm text-paper/60">
          No free tier — just a real trial on every plan. Cancel anytime.
        </p>
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
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-mint">
                7-day free trial
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-paper/80">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-mint">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.stripe}
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
          After the trial, your card is charged the monthly rate. Cancel anytime
          before the trial ends and you won&rsquo;t be charged.
        </p>
      </div>
    </section>
  );
}
