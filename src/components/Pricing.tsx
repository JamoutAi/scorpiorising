"use client";

import { useState, useEffect } from "react";
import { Reveal, StarField, ConstellationThread } from "./Design";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

function PlanButton({ billing, className }: { billing: "monthly" | "annual"; className: string }) {
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase!.auth.getSession().then(({ data }) => {
      if (data.session?.user.id) setSignedIn(true);
    });
  }, []);
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
      {loading ? "Redirecting…" : signedIn ? "Become a Member" : "Try Your First Reflection Free"}
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
      style={{ background: "#f7f3ea", color: "#17251f" }}
    >
      <ConstellationThread className="absolute bottom-16 right-8 hidden w-48 opacity-30 lg:block" />
      <div className="container-x relative z-10">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="reveal mb-5 flex items-center justify-center gap-3">
            <span className="bar" style={{ background: "#1fc896", height: "1px", width: "2rem" }} />
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#1aa37c",
              }}
            >
              Simple Pricing
            </span>
            <span className="bar" style={{ background: "#1fc896", height: "1px", width: "2rem" }} />
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "#17251f",
            }}
          >
            Start free — your first reflection is on us.{" "}
            <em style={{ fontStyle: "italic", color: "#1aa37c" }}>Go deeper when you're ready.</em>
          </h2>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div
                className="card-cream relative h-full p-8 text-center"
                style={
                  t.highlight
                    ? {
                        borderColor: "rgba(31, 200, 150, 0.45)",
                        boxShadow: "0 0 40px rgba(31, 200, 150, 0.10), inset 0 0 0 1px rgba(31, 200, 150, 0.20)",
                      }
                    : undefined
                }
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#1aa37c",
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
                    color: "#17251f",
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                  }}
                >
                  {billing === "annual" ? t.annual : t.monthly}
                  <span
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.8rem",
                      color: "#7a756e",
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
                    color: "#7a756e",
                    marginBottom: "2rem",
                  }}
                >
                  {t.blurb}
                </p>
                <ul className="mx-auto mb-8 flex max-w-xs flex-col gap-3 text-left">
                  {t.features.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span style={{ color: "#1fc896", marginTop: "2px" }}>◎</span>
                      <span style={{ fontFamily: "var(--font-display), serif", fontSize: "1rem", fontWeight: 300, color: "#17251f" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mb-6 inline-flex rounded-full border p-1" style={{ borderColor: "rgba(23,37,31,0.12)", fontFamily: "var(--font-sans), sans-serif" }}>
                  <button
                    onClick={() => setBilling("monthly")}
                    className="rounded-full px-4 py-1 text-xs font-semibold transition"
                    style={billing === "monthly" ? { background: "#1fc896", color: "#072019" } : { color: "#7a756e" }}
                  >
                    Monthly · $12
                  </button>
                  <button
                    onClick={() => setBilling("annual")}
                    className="rounded-full px-4 py-1 text-xs font-semibold transition"
                    style={billing === "annual" ? { background: "#1fc896", color: "#072019" } : { color: "#7a756e" }}
                  >
                    Annual · $99
                  </button>
                </div>
                <p className="mb-5 text-xs uppercase tracking-[0.15em]" style={{ color: "#1aa37c" }}>
                  7-day free trial · cancel anytime
                </p>
                <PlanButton billing={billing} className="btn-phosphor" />
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
            color: "#9a948b",
          }}
        >
          Not a substitute for professional care. Crisis support always available. Privacy is a feature, not fine print.
        </p>
      </div>
    </section>
  );
}
