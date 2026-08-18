"use client";

import { useState } from "react";
import { Reveal, StarField, ConstellationThread } from "./Design";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

function PlanButton({ billing, className }: { billing: "monthly" | "annual"; className: string }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      let userId: string | null = null;
      let email: string | null = null;
      if (isSupabaseConfigured) {
        const { data } = await supabase!.auth.getSession();
        userId = data.session?.user.id ?? null;
        email = data.session?.user.email ?? null;
      }
      // Must be signed in so the webhook can match the plan to this account.
      if (!userId) {
        window.location.href = `/signup?redir=/journal`;
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, userId, email }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else {
        window.location.href = "/pricing";
      }
    } catch {
      window.location.href = "/pricing";
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={onClick} className={`mt-2 block w-full text-center ${className}`} disabled={loading}>
      {loading ? "Redirecting…" : "Try Your First Reflection Free"}
    </button>
  );
}

const tiers = [
  {
    name: "Scorpio Rising",
    monthly: "$12",
    annual: "$99",
    cadence: "/month",
    annualCadence: "/year",
    blurb: "Everything included. One membership.",
    features: [
      "Your natal chart, set once",
      "Unlimited reflective entries",
      "Current transits & daily sky",
      "Long-term memory of your story",
      "Weekly Constellation & patterns",
      "Private by design",
    ],
    cta: "Try Your First Reflection Free",
    highlight: true,
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-28"
      style={{ background: "#15102b" }}
    >
      <StarField count={32} />
      <div className="absolute bottom-16 right-8 hidden w-48 lg:block">
        <ConstellationThread />
      </div>
      <div className="container-x relative z-10">
        <div className="mx-auto mb-16 max-w-2xl text-center">
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
              Simple Pricing
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
              color: "#f0ebe2",
            }}
          >
            Start free — your first reflection is on us.{" "}
            <em style={{ fontStyle: "italic", color: "#2ed79f" }}>Go deeper when you're ready.</em>
          </h2>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div
                className="card-vellum relative h-full p-8"
                style={
                  t.highlight
                    ? {
                        borderColor: "rgba(46, 215, 159, 0.28)",
                        boxShadow: "0 0 40px rgba(31, 200, 150, 0.07), inset 0 0 0 1px rgba(46, 215, 159, 0.12)",
                      }
                    : undefined
                }
              >
                <div
                  className="text-center"
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#2ed79f",
                      marginTop: "0",
                      marginBottom: "1rem",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display), serif",
                      fontSize: "3.5rem",
                      fontWeight: 300,
                      color: "#f0ebe2",
                      lineHeight: 1,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {billing === "annual" ? t.annual : t.monthly}
                    <span
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.8rem",
                        color: "#6c5a79",
                        paddingBottom: "0.4rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {billing === "annual" ? t.annualCadence : t.cadence}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display), serif",
                      fontSize: "0.95rem",
                      color: "#6c5a79",
                      marginBottom: "2rem",
                    }}
                  >
                    {t.blurb}
                  </p>
                  <ul className="mx-auto mb-8 flex max-w-xs flex-col gap-3 text-left">
                    {t.features.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span style={{ color: "#2ed79f", marginTop: "2px" }}>◎</span>
                        <span style={{ fontFamily: "var(--font-display), serif", fontSize: "1rem", fontWeight: 300, color: "#8c8295" }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-6 inline-flex rounded-full border border-white/15 p-1" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
                    <button
                      onClick={() => setBilling("monthly")}
                      className={`rounded-full px-4 py-1 text-xs font-semibold ${billing === "monthly" ? "bg-mint text-ink" : "text-paper/60"}`}
                    >
                      Monthly · $12
                    </button>
                    <button
                      onClick={() => setBilling("annual")}
                      className={`rounded-full px-4 py-1 text-xs font-semibold ${billing === "annual" ? "bg-mint text-ink" : "text-paper/60"}`}
                    >
                      Annual · $99
                    </button>
                  </div>
                  <p className="mb-5 text-xs uppercase tracking-[0.15em]" style={{ color: "#2ed79f" }}>
                    7-day free trial · cancel anytime
                  </p>
                  <PlanButton
                    billing={billing}
                    className="btn-phosphor"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p
          className="reveal mt-8 text-center"
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.68rem",
            letterSpacing: "0.05em",
            color: "#574463",
          }}
        >
          Not a substitute for professional care. Crisis support always available. Privacy is a feature, not fine print.
        </p>
      </div>
    </section>
  );
}
