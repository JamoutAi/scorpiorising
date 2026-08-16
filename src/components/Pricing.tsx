"use client";

import { useState } from "react";
import { Reveal, StarField, ConstellationThread } from "./Design";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

function PlanButton({ plan, stripe, className }: { plan: string; stripe: string; className: string }) {
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId, email }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else {
        // Fallback to the pre-built share link if checkout route fails
        window.location.href = stripe;
      }
    } catch {
      window.location.href = stripe;
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={onClick} className={`mt-2 block w-full text-center ${className}`} disabled={loading}>
      {loading ? "Redirecting…" : "Start 7-day free trial"}
    </button>
  );
}

const tiers = [
  {
    name: "Mirror",
    price: "$9.99",
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
    price: "$17.99",
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
            Start free for 7 days. Go deeper{" "}
            <em style={{ fontStyle: "italic", color: "#2ed79f" }}>when you're ready.</em>
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
                {t.highlight && (
                  <div
                    className="absolute right-4 top-4 flex h-5 w-20 items-center justify-center opacity-30"
                  >
                    <ConstellationThread />
                  </div>
                )}
                {t.highlight && (
                  <div
                    className="absolute left-4 top-4 rounded-full px-3 py-1"
                    style={{
                      background: "rgba(46, 215, 159, 0.12)",
                      border: "1px solid rgba(46, 215, 159, 0.35)",
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.62rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#2ed79f",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: t.highlight ? "#2ed79f" : "#766a83",
                    marginTop: t.highlight ? "2rem" : 0,
                    marginBottom: "1rem",
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "3rem",
                    fontWeight: 300,
                    color: "#f0ebe2",
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                  }}
                >
                  {t.price}
                  <span
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.75rem",
                      color: "#6c5a79",
                      paddingBottom: "0.4rem",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {t.cadence}
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
                <ul className="mb-8 flex flex-col gap-3">
                  {t.features.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span style={{ color: "#2ed79f", marginTop: "2px" }}>◎</span>
                      <span style={{ fontFamily: "var(--font-display), serif", fontSize: "1rem", fontWeight: 300, color: "#8c8295" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="mb-8 block text-xs uppercase tracking-[0.15em]" style={{ color: "#2ed79f" }}>
                  7-day free trial
                </span>
                <PlanButton
                  plan={t.name === "Mirror+" ? "mirror_plus" : "mirror"}
                  stripe={t.stripe}
                  className={t.highlight ? "btn-phosphor" : "btn-ghost"}
                />
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
