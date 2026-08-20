"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { NatalChart } from "@/components/NatalChart";
import { planetMeaning } from "@/lib/chartMeanings";

interface Profile {
  id: string;
  name?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  chart?: any;
  plan_status?: string;
  plan?: string;
}

interface Entry {
  id: string;
  body: string;
  created_at: string;
  reading: string | null;
}

const THEMES: { key: string; words: string[] }[] = [
  { key: "Boundaries", words: ["boundary", "boundaries", "respect", "people-please", "guilt", "permission"] },
  { key: "Work", words: ["job", "work", "boss", "career", "quit", "quitting", "burnout", "business"] },
  { key: "Rest & health", words: ["tired", "exhausted", "sleep", "rest", "anxious", "stress", "calm", "peace"] },
  { key: "Relationships", words: ["partner", "boyfriend", "girlfriend", "husband", "wife", "ex", "family", "friend"] },
  { key: "Self", words: ["worth", "confident", "confidence", "purpose", "identity", "myself"] },
  { key: "Change", words: ["change", "afraid", "scared", "fear", "risk", "transition", "moving", "stuck"] },
  { key: "Joy", words: ["happy", "joy", "excited", "grateful", "proud", "hope", "creative"] },
];

function deg(p: any) {
  if (!p || typeof p.degreeInSign !== "number") return "";
  return `${Math.round(p.degreeInSign)}°`;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: e }] = await Promise.all([
        supabase!.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase!.from("entries").select("id, body, created_at, reading:readings(content)").order("created_at", { ascending: false }).limit(12),
      ]);
      setProfile(p);
      setEntries((e ?? []).map((row: any) => ({ id: row.id, body: row.body, created_at: row.created_at, reading: row.reading?.[0]?.content ?? null })));
    })();
  }, [user]);

  if (!user) return null;

  const chart = profile?.chart;
  const sun = chart?.placements?.find((p: any) => p.key === "sun");
  const moon = chart?.placements?.find((p: any) => p.key === "moon");
  const rising = chart?.placements?.find((p: any) => p.key === "rising");
  const isPaid = profile?.plan_status === "active" || profile?.plan_status === "trialing";

  const themeCounts = THEMES.map((t) => ({
    key: t.key,
    count: entries.filter((e) => t.words.some((w) => (e.body + " " + (e.reading || "")).toLowerCase().includes(w))).length,
  })).filter((t) => t.count > 0).sort((a, b) => b.count - a.count).slice(0, 4);

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar
        email={user.email ?? undefined}
        name={profile?.name ?? undefined}
        onSignOut={() => { supabase!.auth.signOut().then(() => router.replace("/")); }}
        active="My Chart"
      />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-6xl px-5 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "#1aa37c" }}>My Chart</p>
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(2.2rem,4.5vw,3.2rem)", fontWeight: 300, color: "#17251f", lineHeight: 1.05 }}>
              Good{new Date().getHours() < 12 ? " morning" : new Date().getHours() < 18 ? " afternoon" : " evening"}, {profile?.name?.split(" ")[0] || "friend"}.
            </h1>
            <p className="mt-2 text-base" style={{ color: "#7a756e" }}>Here is your cosmic and personal snapshot.</p>
          </div>

          {/* Snapshot cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Sun", sign: chart?.sun, d: deg(sun), note: planetMeaning("sun", chart?.sun) || "" },
              { label: "Moon", sign: chart?.moon, d: deg(moon), note: planetMeaning("moon", chart?.moon) || "" },
              { label: "Rising", sign: chart?.rising, d: deg(rising), note: planetMeaning("rising", chart?.rising) || "" },
            ].map((s) => (
              <div key={s.label} className="card-cream p-5">
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "#9a948b" }}>{s.label}</p>
                <p style={{ fontFamily: "var(--font-display), serif", fontSize: "1.7rem", fontWeight: 300, color: "#17251f" }}>
                  {s.sign || "—"}{s.d && <span style={{ fontSize: "1rem", color: "#1aa37c" }}> {s.d}</span>}
                </p>
                <p className="mt-1 text-xs leading-snug" style={{ color: "#7a756e" }}>{s.note}</p>
              </div>
            ))}
          </div>

          {/* Chart + Chapter */}
          <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {/* Birth chart */}
            <section className="card-cream p-6">
              <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Your birth chart</h2>
              {chart ? (
                <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <div className="shrink-0">
                    <NatalChart chart={chart} size={260} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: "#7a756e" }}>
                      Sun in {chart.sun}{deg(sun) && ` ${deg(sun)}`}, Moon in {chart.moon}{deg(moon) && ` ${deg(moon)}`}, Rising {chart.rising}{deg(rising) && ` ${deg(rising)}`}.
                    </p>
                    <p className="mt-2 text-sm" style={{ color: "#3a4a43" }}>{planetMeaning("rising", chart.rising)}</p>
                    <button onClick={() => router.push("/journal")} className="btn-ghost mt-4" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#1aa37c" }}>
                      Show me my chart
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p style={{ color: "#7a756e" }}>No chart set yet.</p>
                  <button onClick={() => router.push("/journal")} className="btn-phosphor mt-4">Set your chart</button>
                </div>
              )}
            </section>

            {/* Current chapter / story so far */}
            <section className="card-cream p-6">
              <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Your story so far</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(31,200,150,0.08)" }}>
                  <span style={{ color: "#17251f" }}>Journal entries</span>
                  <span className="font-medium" style={{ color: "#1aa37c" }}>{entries.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(31,200,150,0.08)" }}>
                  <span style={{ color: "#17251f" }}>Membership</span>
                  <span className="font-medium" style={{ color: "#1aa37c" }}>{isPaid ? "Member" : "Free"}</span>
                </div>
                {themeCounts.length > 0 && (
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(197,164,107,0.10)" }}>
                    <p className="mb-2 text-xs uppercase tracking-[0.16em]" style={{ color: "#9a948b" }}>Recurring themes</p>
                    <div className="flex flex-wrap gap-2">
                      {themeCounts.map((t) => (
                        <span key={t.key} className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(23,37,31,0.06)", color: "#17251f" }}>{t.key}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => router.push("/story")} className="btn-ghost w-full" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#1aa37c" }}>
                  View your timeline
                </button>
              </div>
            </section>
          </div>

          {/* Sky today + quick actions */}
          <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="card-cream p-6">
              <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Your daily star reading</h2>
              <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>A general reading of today&apos;s sky moving through your chart. Included in every membership.</p>
              <button onClick={() => router.push("/reading")} className="btn-phosphor mt-4">Show me the stars</button>
            </section>

            <section className="card-cream p-6">
              <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Quick actions</h2>
              <div className="mt-4 space-y-2">
                <button onClick={() => router.push("/ask")} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-black/5" style={{ background: "rgba(31,200,150,0.08)", color: "#17251f" }}>
                  <span>Ask Scorpio Rising</span><span style={{ color: "#1aa37c" }}>→</span>
                </button>
                <button onClick={() => router.push("/journal")} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-black/5" style={{ background: "rgba(31,200,150,0.08)", color: "#17251f" }}>
                  <span>Write in your journal</span><span style={{ color: "#1aa37c" }}>→</span>
                </button>
                <button onClick={() => router.push("/patterns")} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-black/5" style={{ background: "rgba(31,200,150,0.08)", color: "#17251f" }}>
                  <span>See your patterns</span><span style={{ color: "#1aa37c" }}>→</span>
                </button>
              </div>
            </section>
          </div>

          {/* Past entries */}
          <section className="card-cream p-6">
            <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Past entries ({entries.length})</h2>
            {entries.length === 0 ? (
              <p className="mt-3 text-sm" style={{ color: "#7a756e" }}>No entries yet. Your reflections will appear here.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {entries.map((e) => (
                  <article key={e.id} className="rounded-xl border p-4" style={{ borderColor: "rgba(23,37,31,0.08)" }}>
                    <p className="mb-1 text-xs" style={{ color: "#9a948b" }}>{new Date(e.created_at).toLocaleString()}</p>
                    <p className="whitespace-pre-wrap text-sm" style={{ color: "#17251f" }}>{e.body}</p>
                    {e.reading && <p className="mt-2 border-t pt-2 text-sm" style={{ borderColor: "rgba(23,37,31,0.08)", color: "#3a4a43" }}>{e.reading}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Discreet management entry */}
          <div className="mt-6 text-center">
            <Link
              href="/settings"
              className="text-xs uppercase tracking-[0.14em] transition hover:text-[#1aa37c]"
              style={{ color: "#9a948b" }}
            >
              Manage membership &amp; account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
