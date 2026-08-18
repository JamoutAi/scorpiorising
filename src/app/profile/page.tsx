"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

interface Profile {
  id: string;
  name?: string;
  email?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  chart?: any;
  plan?: string;
  plan_status?: string;
}
interface Entry {
  id: string;
  body: string;
  created_at: string;
  reading: string | null;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [planInfo, setPlanInfo] = useState<string>("Checking…");
  const [isPlus, setIsPlus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // daily star reading
  const [daily, setDaily] = useState<string | null>(null);
  const [dailyBusy, setDailyBusy] = useState(false);
  const [dailyErr, setDailyErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/journal", { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProfile(data.profile);
      setEntries(data.entries || []);

      try {
        const sub = await (await fetch("/api/subscription", { headers: { authorization: `Bearer ${token}` } })).json();
        if (sub.hasPlan) {
          const plus = sub.plan === "mirror_plus";
          setIsPlus(plus);
          setPlanInfo(plus ? "Mirror+" : "Mirror");
        } else if (data.profile?.plan_status === "active" || data.profile?.plan_status === "trialing") {
          const plus = data.profile.plan === "mirror_plus";
          setIsPlus(plus);
          setPlanInfo(plus ? "Mirror+" : "Mirror");
        } else {
          setPlanInfo("Free / no active plan");
        }
      } catch {
        setPlanInfo(data.profile?.plan_status === "active" ? "Active" : "Free / no active plan");
      }
    })();
  }, [user]);

  async function manageBilling() {
    setBusy(true);
    const token = (await supabase!.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/billing-portal", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBusy(false);
    if (data.url) window.location.href = data.url;
    else router.push(data.url || "/pricing");
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry and its reflection? This can't be undone.")) return;
    const token = (await supabase!.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "deleteEntry", entryId: id }),
    });
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function showStars() {
    setDailyBusy(true);
    setDailyErr(null);
    setDaily(null);
    const token = (await supabase!.auth.getSession()).data.session?.access_token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 95000);
    try {
      const res = await fetch("/api/daily-reading", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await res.json();
      if (res.ok) setDaily(data.reading);
      else if (res.status === 402) setDailyErr("Daily star readings are a Mirror+ feature. Upgrade to unlock.");
      else setDailyErr("Couldn't generate your star reading just now. Try again.");
    } catch {
      setDailyErr("The stars are taking their time. Try again in a moment.");
    } finally {
      clearTimeout(timer);
      setDailyBusy(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Nav />
      <main className="flex-1 px-5 py-16" style={{ background: "#15102b" }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <Logo />
            <h1
              style={{ fontFamily: "var(--font-display), serif", fontSize: scrolled ? "1.5rem" : "2.4rem", fontWeight: 300, color: "#f6f4f1", marginTop: "1rem", transition: "font-size 300ms cubic-bezier(0.23,1,0.32,1), opacity 300ms ease", opacity: scrolled ? 0.85 : 1 }}
            >
              Your Profile
            </h1>
          </div>

          {/* Birth chart */}
          <section className="card-vellum mb-6 p-7">
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#f0ebe2" }}>
              Your birth chart
            </h2>
            {profile?.chart ? (
              <div className="flex flex-wrap gap-2">
                <Chip label="Sun" value={profile.chart.sun} />
                <Chip label="Moon" value={profile.chart.moon} />
                <Chip label="Rising" value={profile.chart.rising} />
                {profile.chart.risingApprox && (
                  <span className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(255,255,255,0.1)", color: "#cdc5b1" }}>
                    Rising approximate
                  </span>
                )}
              </div>
            ) : (
              <p style={{ color: "#8c8295" }}>No chart set yet.</p>
            )}
            <button onClick={() => router.push("/journal")} className="btn-ghost mt-4">
              Show me my chart
            </button>
          </section>

          {/* Daily star reading (Mirror+) */}
          <section className="card-vellum mb-6 p-7">
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#f0ebe2" }}>
              Your daily star reading
            </h2>
            <p className="mb-4 text-sm" style={{ color: "#8c8295" }}>
              A general reading of today&rsquo;s sky moving through your chart. A Mirror+ feature.
            </p>
            <button onClick={showStars} disabled={dailyBusy} className="btn-phosphor">
              {dailyBusy ? "Reading the sky…" : "Show me the stars"}
            </button>
            {dailyBusy && (
              <p className="mt-3 text-xs" style={{ color: "#8c8295" }}>
                Reading your stars — this can take up to a minute.
              </p>
            )}
            {dailyErr && (
              <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm" style={{ color: "#cdc5b1", background: "rgba(255,255,255,0.04)" }}>
                {dailyErr}
                {!isPlus && (
                  <button onClick={() => router.push("/pricing")} className="btn-ghost ml-3 mt-2">
                    Upgrade to Mirror+
                  </button>
                )}
              </p>
            )}
            {daily && (
              <div className="mt-5 rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: "#cdc5b1" }}>
                  {daily}
                </p>
                <p className="mt-4 text-xs" style={{ color: "#8c8295" }}>
                  Reflection and support, not therapy.
                </p>
              </div>
            )}
          </section>

          {/* Past entries */}
          <section className="card-vellum p-7">
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#f0ebe2" }}>
              Past entries ({entries.length})
            </h2>
            {entries.length === 0 ? (
              <p style={{ color: "#8c8295" }}>No entries yet. Your reflections live in your journal.</p>
            ) : (
              <div className="space-y-4">
                {entries.map((e) => (
                  <article key={e.id} className="rounded-2xl border p-5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs" style={{ color: "#8c8295" }}>{new Date(e.created_at).toLocaleString()}</p>
                      <button
                        onClick={() => deleteEntry(e.id)}
                        className="text-xs uppercase tracking-[0.1em] transition hover:text-red-300"
                        style={{ color: "#8c8295" }}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap" style={{ color: "#cdc5b1" }}>{e.body}</p>
                    {e.reading && (
                      <p className="mt-3 border-t pt-3 text-sm" style={{ borderColor: "rgba(255,255,255,0.1)", color: "#cdc5b1" }}>
                        {e.reading}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
            <button onClick={() => router.push("/journal")} className="btn-ghost mt-5">
              Open your journal
            </button>
          </section>

          {/* Plan — at the bottom */}
          <section className="card-vellum mt-6 p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#2ed79f" }}>
                  Plan
                </p>
                <p className="mt-1" style={{ fontSize: "1.4rem", color: "#f0ebe2" }}>
                  {planInfo}
                </p>
                {profile?.email && (
                  <p className="mt-1 text-sm" style={{ color: "#8c8295" }}>
                    {profile.email}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {!isPlus && (
                  <button onClick={() => router.push("/pricing")} className="btn-phosphor">
                    Upgrade to Mirror+
                  </button>
                )}
                <button onClick={manageBilling} disabled={busy} className="btn-ghost">
                  {busy ? "Opening…" : "Manage billing"}
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs" style={{ color: "#8c8295" }}>
              Upgrade, cancel, or update your payment method via Stripe.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full px-4 py-2 text-sm" style={{ background: "rgba(46,215,159,0.12)", color: "#2ed79f" }}>
      <span style={{ opacity: 0.7 }}>{label}: </span>
      {value}
    </span>
  );
}
