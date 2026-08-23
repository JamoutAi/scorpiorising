"use client";

import { useState, useEffect } from "react";
import { Reveal, StarField, ConstellationThread } from "./Design";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

function PlanButton({ billing, label, className }: { billing: "monthly" | "annual"; label: string; className: string }) {
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
      if (!userId) {
        window.location.href = `/start-trial?billing=${billing}`;
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
      {loading ? "Redirecting…" : label}
    </button>
  );
}

const tiers = [
  {
    name: "Monthly",
    billing: "monthly" as const,
    price: "$16.99",
    cadence: "/month",
    equiv: null as string | null,
    blurb: "Flexible. Cancel anytime.",
    features: [
      "Your natal chart, set once",
      "Unlimited reflective entries",
      "Current transits & daily sky",
      "Long-term memory of your story",
      "Weekly Constellation & patterns",
      "Private by design",
    ],
    highlight: false,
    badge: null as string | null,
  },
  {
    name: "Annual",
    billing: "annual" as const,
    price: "$79.99",
    cadence: "/year",
    equiv: "$6.67/mo billed annually",
    blurb: "Best value. Two months free.",
    features: [
      "Everything in Monthly",
      "7-day free trial — then $6.67/mo",
      "Save over paying monthly",
      "All future features included",
    ],
    highlight: true,
    badge: "7-Day Free Trial",
  },
];

export function Pricing() {
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
            Start free for 7 days.{" "}
            <em style={{ fontStyle: "italic", color: "#1aa37c" }}>Keep going when it helps.</em>
          </h2>
          <p className="reveal mt-4 text-base" style={{ color: "#7a756e" }}>
            Try Scorpio Rising free for a week. Then $16.99/month or $79.99/year. Cancel anytime.
          </p>
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
                {t.badge && (
                  <span
                    className="absolute -top-3 right-6 rounded-full px-4 py-1 text-xs font-semibold"
                    style={{ background: "#c5a46b", color: "#08201a" }}
                  >
                    {t.badge}
                  </span>
                )}
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
                  {t.price}
                  <span
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.8rem",
                      color: "#7a756e",
                      paddingBottom: "0.4rem",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {t.cadence}
                  </span>
                </div>
                {t.equiv && (
                  <p className="mb-2 text-sm" style={{ color: "#1aa37c" }}>{t.equiv}</p>
                )}
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
                <p className="mb-5 text-xs uppercase tracking-[0.15em]" style={{ color: "#1aa37c" }}>
                  7-day free trial · cancel anytime
                </p>
                <PlanButton
                  billing={t.billing}
                  label={t.highlight ? "Start 7-Day Free Trial" : "Start 7-Day Free Trial"}
                  className="btn-phosphor"
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
            color: "#9a948b",
          }}
        >
          Not a substitute for professional care. Scorpio Rising is reflection, not a crisis service — see our{" "}
          <a href="/support" style={{ color: "#c5a46b", textDecoration: "underline" }}>
            Support
          </a>{" "}
          page in a crisis. Privacy is a feature, not fine print.
        </p>
      </div>
    </section>
  );
}
