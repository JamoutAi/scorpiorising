"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
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
  const [planInfo, setPlanInfo] = useState<string>(" Checking…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/journal", { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProfile(data.profile);
      setEntries(data.entries || []);

      // Resolve plan status from Stripe (authoritative).
      try {
        const sub = await (await fetch("/api/subscription", { headers: { authorization: `Bearer ${token}` } })).json();
        if (sub.hasPlan) setPlanInfo(sub.plan === "mirror_plus" ? "Mirror+" : "Mirror");
        else if (data.profile?.plan_status === "active" || data.profile?.plan_status === "trialing")
          setPlanInfo(data.profile.plan === "mirror_plus" ? "Mirror+" : "Mirror");
        else setPlanInfo("Free / no active plan");
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

  if (!user) return null;

  return (
    <>
      <Nav />
      <main className="flex-1 px-5 py-16" style={{ background: "#15102b" }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <Logo />
            <h1
              style={{ fontFamily: "var(--font-display), serif", fontSize: "2.4rem", fontWeight: 300, color: "#f0ebe2", marginTop: "1rem" }}
            >
              Your Profile
            </h1>
          </div>

          {/* Plan card */}
          <section className="card-vellum mb-6 p-7">
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
              <button onClick={manageBilling} disabled={busy} className="btn-phosphor">
                {busy ? "Opening…" : "Manage billing"}
              </button>
            </div>
            <p className="mt-4 text-xs" style={{ color: "#8c8295" }}>
              Upgrade, cancel, or update your payment method via Stripe.
            </p>
          </section>

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
              {profile?.chart ? "Edit chart" : "Add your chart"}
            </button>
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
                    <p className="text-xs" style={{ color: "#8c8295" }}>{new Date(e.created_at).toLocaleString()}</p>
                    <p className="mt-2 whitespace-pre-wrap" style={{ color: "#cdc5b1" }}>{e.body}</p>
                    {e.reading && (
                      <p className="mt-3 border-t pt-3 text-sm" style={{ borderColor: "rgba(255,255,255,0.1)", color: "#a99fb8" }}>
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
