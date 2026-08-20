"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Sidebar } from "@/components/Sidebar";
import { NatalChart } from "@/components/NatalChart";
import { placementMeaning, PLACEMENT_LABEL, PLACEMENT_INTRO, type PlacementType, planetMeaning } from "@/lib/chartMeanings";

interface Profile {
  id: string;
  name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  chart?: any;
  plan_status?: string;
}
interface Entry {
  id: string;
  body: string;
  created_at: string;
  reading: string | null;
}

export default function JournalPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [gated, setGated] = useState(false);

  const [freeLimit, setFreeLimit] = useState(false);
  const [freeLimitMsg, setFreeLimitMsg] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [name, setName] = useState("");
  const [formMsg, setFormMsg] = useState("");

  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    (async () => {
      const { data: p } = await supabase!
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p);
      setGated(false);

      const { data: e } = await supabase!
        .from("entries")
        .select("id, body, created_at, reading")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEntries(e ?? []);

      const isActive =
        p?.plan_status === "active" || p?.plan_status === "trialing";
      if (!isActive && (e ?? []).length >= 1) {
        setFreeLimit(true);
        setFreeLimitMsg(
          "You've had your first free reflection. Become a member to keep writing — it's $12/month or $99/year."
        );
      }
      setLoaded(true);
    })();
  }, [loading, user]);

  async function saveProfile(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user) return;
    setBusy(true);
    setFormMsg("");
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveProfile", birthDate, birthTime, birthPlace, name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not read chart");
      const { data: p } = await supabase!
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p);
      setFormMsg("Your chart is set. Start writing below.");
    } catch (err: any) {
      setFormMsg(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitEntry(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user || !entry.trim() || freeLimit) return;
    setBusy(true);
    setReflection(null);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addEntry", entry }),
      });
      const json = await res.json();
      if (res.status === 402) {
        setFreeLimit(true);
        setFreeLimitMsg(
          json.error ||
            "You've used your free reflection — become a member to keep writing."
        );
        return;
      }
      setReflection(json.reflection ?? "Saved. Your reflection will appear shortly.");
      setEntry("");
      const { data: e } = await supabase!
        .from("entries")
        .select("id, body, created_at, reading")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEntries(e ?? []);
    } catch {
      setReflection("Saved. Your reflection will appear shortly.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteEntry(id: string) {
    if (!user) return;
    await supabase!.from("entries").delete().eq("id", id).eq("user_id", user.id);
    setEntries((prev) => prev.filter((x) => x.id !== id));
  }

  async function signOut() {
    await supabase!.auth.signOut();
    router.replace("/");
  }

  if (!configured) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#0c2a23", color: "#9bb3aa" }}>
          Sign-in isn&rsquo;t configured yet. Add the Supabase keys in Vercel and run the schema SQL.
        </main>
        <Footer />
      </>
    );
  }

  if (loading || (!user && !loaded)) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#0c2a23", color: "#9bb3aa" }}>Opening your journal…</main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Nav />
        <main className="flex-1 flex items-center justify-center px-5 py-32" style={{ background: "#0c2a23" }}>
          <div className="card-cream max-w-md p-10 text-center">
            <div className="mx-auto mb-6 w-40 opacity-30">
              <Logo />
            </div>
            <p className="text-ink/70">Please sign in to open your journal.</p>
            <Link href="/login?redir=/profile" className="btn-phosphor mt-6 inline-block">Sign in</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />

      <Sidebar email={user.email ?? undefined} name={profile?.name ?? undefined} onSignOut={signOut} active="Journal" />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-4xl px-5 py-12">
          {/* Mobile header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.8rem", fontWeight: 300, color: "#17251f" }}>Your Journal</h1>
            <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full text-sm" style={{ background: "rgba(31,200,150,0.18)", color: "#1aa37c" }}>
              {(profile?.name || user.email || "S").charAt(0).toUpperCase()}
            </Link>
          </div>

          {/* Chart setup */}
          {!profile?.chart ? (
            <section className="card-cream mt-2 p-8">
              <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>
                Set your chart
              </h2>
              <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>
                Tell us when and where you were born. We read your natal chart so
                every reflection is written in the voice of your stars.
              </p>
              <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm" style={{ color: "#17251f" }}>
                  Birth date
                  <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="paper-input mt-1 w-full px-4 py-3" />
                </label>
                <label className="text-sm" style={{ color: "#17251f" }}>
                  Birth time
                  <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="paper-input mt-1 w-full px-4 py-3" />
                  <span className="mt-1 block text-xs" style={{ color: "#9a948b" }}>Unknown? Leave blank — Rising sign becomes approximate.</span>
                </label>
                <label className="text-sm sm:col-span-2" style={{ color: "#17251f" }}>
                  Birth city / place
                  <input type="text" required placeholder="e.g. Austin, Texas" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="paper-input mt-1 w-full px-4 py-3" />
                </label>
                <label className="text-sm sm:col-span-2" style={{ color: "#17251f" }}>
                  Name (optional)
                  <input type="text" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} className="paper-input mt-1 w-full px-4 py-3" />
                </label>
                <button type="submit" disabled={busy} className="btn-phosphor sm:col-span-2">
                  {busy ? "Reading your chart…" : "Save my chart"}
                </button>
                {formMsg && <p className="sm:col-span-2 text-sm" style={{ color: "#1aa37c" }}>{formMsg}</p>}
              </form>
            </section>
          ) : (
            <>
              {/* Bento: chart + write */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                {/* Chart card */}
                <section className="card-cream p-6">
                  <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="shrink-0">
                      <NatalChart chart={profile.chart} size={180} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>Your chart</span>
                        <Chip label="Sun" value={profile.chart.sun} />
                        <Chip label="Moon" value={profile.chart.moon} />
                        <Chip label="Rising" value={profile.chart.rising} />
                        {profile.chart.risingApprox && (
                          <span className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(23,37,31,0.06)", color: "#7a756e" }}>Rising approximate</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "#3a4a43" }}>
                    Sun in {profile.chart.sun}, Moon in {profile.chart.moon}, Rising {profile.chart.rising}.
                    {profile.chart.risingApprox ? " (Rising approximate — add your birth time for precision.)" : ""}
                  </p>
                </section>

                {/* Write card */}
                <section className="card-cream flex flex-col p-6">
                  <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.4rem", fontWeight: 300, color: "#17251f" }}>Write a reflection</h2>
                  <p className="mb-3 text-sm" style={{ color: "#7a756e" }}>Scorpio Rising reads your stars as you write.</p>
                  <form onSubmit={submitEntry} className="flex flex-1 flex-col">
                    <textarea
                      value={entry}
                      onChange={(e) => setEntry(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={5}
                      disabled={freeLimit}
                      className="paper-input w-full flex-1 px-5 py-4 text-lg disabled:opacity-50"
                      style={{ fontFamily: "var(--font-display), serif" }}
                    />
                    <button type="submit" disabled={busy || !entry.trim() || freeLimit} className="btn-phosphor mt-3 self-start">
                      {busy ? "Connecting the dots…" : "Write"}
                    </button>
                    {freeLimit ? (
                      <p className="mt-2 text-xs" style={{ color: "#1aa37c" }}>You've used your free reflection — upgrade to keep writing.</p>
                    ) : busy ? (
                      <p className="mt-2 text-xs" style={{ color: "#7a756e" }}>Reading your stars — this can take up to a minute.</p>
                    ) : null}
                  </form>
                  {reflection && (
                    <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(23,37,31,0.08)" }}>
                      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>Your reflection</p>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: "#17251f" }}>{reflection}</p>
                      <p className="mt-3 text-xs" style={{ color: "#9a948b" }}>Reflection and support, not therapy.</p>
                    </div>
                  )}
                </section>
              </div>

              {/* Rest of your sky */}
              {profile.chart.placements?.length > 0 && (
                <div className="card-cream mt-6 p-6">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ color: "#7a756e" }}>The rest of your sky</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.chart.placements
                      .filter((p: any) => !["sun", "moon", "rising", "ascendant"].includes(p.key?.toLowerCase()))
                      .map((p: any, i: number) => (
                        <div key={i} className="rounded-xl border p-4" style={{ borderColor: "rgba(23,37,31,0.08)", background: "#fffdf8" }}>
                          <p className="text-sm uppercase tracking-[0.18em]" style={{ color: "#1aa37c" }}>
                            {p.label} in {p.sign}
                            {p.retrograde ? " (retrograde)" : ""}
                          </p>
                          <p className="mt-2 text-base leading-relaxed" style={{ color: "#17251f" }}>
                            {planetMeaning(p.label, p.sign) || `Your ${p.label.toLowerCase()} in ${p.sign} colors how this planet expresses through you.`}
                          </p>
                        </div>
                      ))}
                  </div>
                  <a
                    href="https://www.etsy.com/shop/WitchyBitchyAndWise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-medium transition hover:underline"
                    style={{ color: "#1aa37c" }}
                  >
                    Get a custom reading from our favorite astrologer →
                  </a>
                </div>
              )}

              {freeLimit && (
                <div className="card-cream mt-6 border border-[#1fc896]/40 p-8 text-center">
                  <p style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Your free reflection is complete.</p>
                  <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "#7a756e" }}>{freeLimitMsg}</p>
                  <Link href="/pricing" className="btn-phosphor mt-6 inline-block">
                    See plans &amp; upgrade
                  </Link>
                </div>
              )}

              {/* History */}
              {entries.length > 0 && (
                <section className="mt-10 space-y-6">
                  <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.4rem", fontWeight: 300, color: "#17251f" }}>Past entries</h2>
                  {entries.map((e) => (
                    <article key={e.id} className="card-cream p-6">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-xs" style={{ color: "#9a948b" }}>{new Date(e.created_at).toLocaleString()}</p>
                        <button
                          onClick={() => deleteEntry(e.id)}
                          className="text-xs uppercase tracking-[0.1em] transition hover:text-red-500"
                          style={{ color: "#b0a99f" }}
                        >
                          Delete
                        </button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap" style={{ color: "#17251f" }}>{e.body}</p>
                      {e.reading && (
                        <p className="mt-4 border-t pt-4" style={{ borderColor: "rgba(23,37,31,0.08)", color: "#3a4a43" }}>{e.reading}</p>
                      )}
                    </article>
                  ))}
                </section>
              )}

              {entries.length === 0 && !reflection && (
                <p className="mt-12 text-center" style={{ color: "#9a948b" }}>Your journal is empty. Write your first entry above.</p>
              )}

              <p className="mt-12 text-center text-sm" style={{ color: "#9a948b" }}>
                Need support? <Link href="/support" className="underline" style={{ color: "#1aa37c" }}>Crisis resources</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full px-4 py-1.5 text-sm" style={{ background: "rgba(31,200,150,0.14)", color: "#17251f" }}>
      <span style={{ color: "#1aa37c" }}>{label}</span> in {value}
    </span>
  );
}

function MeaningBlock({ type, sign }: { type: PlacementType; sign: string }) {
  const meaning = placementMeaning(type, sign);
  if (!meaning) return null;
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "rgba(23,37,31,0.08)", background: "#fffdf8" }}>
      <p className="text-sm uppercase tracking-[0.18em]" style={{ color: "#1aa37c" }}>
        {PLACEMENT_LABEL[type]} in {sign}
      </p>
      <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>
        {PLACEMENT_INTRO[type]}
      </p>
      <p className="mt-3 text-base leading-relaxed" style={{ color: "#17251f" }}>
        {meaning}
      </p>
    </div>
  );
}
