"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
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

  // chart-setup form
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [name, setName] = useState("");
  const [formMsg, setFormMsg] = useState("");

  // compose
  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/journal");
  }, [loading, user, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const session = (await supabase!.auth.getSession()).data.session;
        const token = session?.access_token;

        // Authoritative check: does this user have a live/trialing Stripe subscription?
        let hasLivePlan = false;
        if (token) {
          try {
            const subRes = await fetch("/api/subscription", {
              headers: { authorization: `Bearer ${token}` },
            });
            if (subRes.ok) {
              const sub = await subRes.json();
              hasLivePlan = !!sub.hasPlan;
            }
          } catch {
            /* ignore — fall back to DB profile below */
          }
        }

        const res = await fetch("/api/journal", {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile(data.profile);
        setEntries(data.entries || []);
        const status = data.profile?.plan_status;
        // Allow access if DB says active/trialing OR Stripe confirms a live plan.
        if (status !== "active" && status !== "trialing" && !hasLivePlan) {
          setGated(true);
          return;
        }
        setGated(false);
        if (data.profile) {
          setName(data.profile.name || "");
          setBirthDate(data.profile.birth_date || "");
          setBirthTime(data.profile.birth_time || "");
          setBirthPlace(data.profile.birth_place || "");
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormMsg("");
    const token = (await supabase!.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "saveProfile", birthDate, birthTime, birthPlace, name }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      const detail = typeof data.error === "string" && data.error ? ` (${data.error})` : "";
      setFormMsg(
        data.error === "place_not_found"
          ? "We couldn't find that place. Try a city, e.g. 'Austin, Texas'."
          : `Something went wrong saving your chart.${detail}`,
      );
      return;
    }
    setProfile(data.profile);
    setFormMsg("Your chart is set. ✦");
  }

  async function submitEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!entry.trim()) return;
    setBusy(true);
    setReflection(null);
    const token = (await supabase!.auth.getSession()).data.session?.access_token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 95000);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "addEntry", entry }),
        signal: controller.signal,
      });
      const data = await res.json();
      setBusy(false);
      if (res.ok) {
        setEntries((prev) => [
          { id: data.entry.id, body: data.entry.body, created_at: data.entry.created_at, reading: data.reading },
          ...prev,
        ]);
        setReflection(data.reading);
        setEntry("");
      } else {
        setReflection("Your entry was saved, but the reflection took too long to generate. You can refresh to see it in Past entries.");
      }
    } catch (err) {
      setBusy(false);
      setReflection(
        controller.signal.aborted
          ? "The reflection is taking longer than expected. Your entry was saved — check Past entries in a moment."
          : "Something went wrong. Your entry may still be saved in Past entries.",
      );
    } finally {
      clearTimeout(timer);
    }
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

  async function signOut() {
    await supabase!.auth.signOut();
    router.replace("/");
  }

  if (!configured) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#15102b", color: "#8c8295" }}>
          Sign-in isn&rsquo;t configured yet. Add the Supabase keys in Vercel and run the schema SQL.
        </main>
        <Footer />
      </>
    );
  }
  if (loading || !loaded) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#15102b", color: "#766a83" }}>Opening your journal…</main>
      </>
    );
  }
  if (!user) return null;

  if (gated) {
    return (
      <>
        <Nav />
        <main className="flex-1 flex items-center justify-center px-5 py-32" style={{ background: "#15102b" }}>
          <div className="card-vellum max-w-md p-10 text-center">
            <div className="mx-auto mb-6 w-40 opacity-30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="" className="mx-auto h-20 w-20 object-contain" />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "2rem",
                fontWeight: 300,
                color: "#f0ebe2",
                marginBottom: "0.75rem",
              }}
            >
              Your journal is behind a plan.
            </h1>
            <p
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "1.05rem",
                fontWeight: 300,
                color: "#7d7189",
                marginBottom: "2rem",
              }}
            >
              Start your 7-day free trial to open your diary and receive chart-aware reflections.
            </p>
            <Link href="/#pricing" className="btn-phosphor">
              Choose a plan
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="flex-1" style={{ background: "#15102b" }}>
        <div className="mx-auto max-w-3xl px-5 py-12">
          <div className="flex items-center justify-between">
            <h1
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: scrolled ? "1.5rem" : "2.4rem",
                fontWeight: 300,
                color: "#f6f4f1",
                transition: "font-size 300ms cubic-bezier(0.23,1,0.32,1), opacity 300ms ease",
                opacity: scrolled ? 0.85 : 1,
              }}
            >
              Your Journal
            </h1>
            <button
              onClick={signOut}
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#766a83",
              }}
              className="underline"
            >
              Sign out
            </button>
          </div>

          {/* Chart setup */}
          {!profile?.chart ? (
            <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h2 className="font-serif text-xl font-semibold text-paper">
                Set your chart
              </h2>
              <p className="mt-2 text-sm text-paper/70">
                Tell us when and where you were born. We read your natal chart so
                every reflection is written in the voice of your stars.
              </p>
              <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-paper">
                  Birth date
                  <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none focus:border-mint/50" />
                </label>
                <label className="text-sm text-paper">
                  Birth time
                  <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none focus:border-mint/50" />
                  <span className="mt-1 block text-xs text-paper/50">Unknown? Leave blank — Rising sign becomes approximate.</span>
                </label>
                <label className="text-sm text-paper sm:col-span-2">
                  Birth city / place
                  <input type="text" required placeholder="e.g. Austin, Texas" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50" />
                </label>
                <label className="text-sm text-paper sm:col-span-2">
                  Name (optional)
                  <input type="text" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50" />
                </label>
                <button type="submit" disabled={busy} className="sm:col-span-2 rounded-full bg-mint px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright disabled:opacity-60">
                  {busy ? "Reading your chart…" : "Save my chart"}
                </button>
                {formMsg && <p className="sm:col-span-2 text-sm text-mint">{formMsg}</p>}
              </form>
            </section>
          ) : (
            <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-mint">Your chart</span>
                <Chip label="Sun" value={profile.chart.sun} />
                <Chip label="Moon" value={profile.chart.moon} />
                <Chip label="Rising" value={profile.chart.rising} />
                {profile.chart.risingApprox && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-paper/60">Rising approximate</span>
                )}
              </div>

              {/* Core three */}
              <div className="grid gap-3 sm:grid-cols-3">
                <MeaningBlock type="sun" sign={profile.chart.sun} />
                <MeaningBlock type="moon" sign={profile.chart.moon} />
                <MeaningBlock type="rising" sign={profile.chart.rising} />
              </div>

              {/* Full planetary readout */}
              {profile.chart.placements?.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ color: "#8c8295" }}>
                    The rest of your sky
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.chart.placements
                      .filter((p: any) => !["sun", "moon", "rising", "ascendant"].includes(p.key?.toLowerCase()))
                      .map((p: any, i: number) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "#2ed79f" }}>
                            {p.label} in {p.sign}
                            {p.retrograde ? " (retrograde)" : ""}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#cdc5b1" }}>
                            {planetMeaning(p.label, p.sign) || `Your ${p.label.toLowerCase()} in ${p.sign} colors how this planet expresses through you.`}
                          </p>
                        </div>
                      ))}
                  </div>
                  <a
                    href="https://www.etsy.com/listing/4507354459/personalized-astrology-birth-chart?ref=shop_home_feat_2&sr_prefetch=1&pf_from=shop_home&dd=1&logging_key=2a944cfa3166e012f68d1db075862f4f0e9904d5%3A4507354459"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm transition hover:text-[#2ed79f]"
                    style={{ color: "#2ed79f" }}
                  >
                    Get a custom reading from our favorite astrologer →
                  </a>
                </div>
              )}
            </section>
          )}

          {/* Compose */}
          <form onSubmit={submitEntry} className="mt-8">
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Write what you can't say out loud…"
              rows={5}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
            />
            <button
              type="submit"
              disabled={busy || !entry.trim()}
              className="mt-3 rounded-full bg-mint px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright disabled:opacity-60"
            >
              {busy ? "Manifesting…" : "Receive your reflection"}
            </button>
            {busy && (
              <p className="mt-2 text-xs" style={{ color: "#8c8295" }}>
                Reading your stars — this can take up to a minute.
              </p>
            )}
          </form>

          {reflection && (
            <div className="mt-6 rounded-2xl border border-mint/30 bg-mint/10 p-6 text-paper">
              <p className="text-xs uppercase tracking-[0.2em] text-mint">Your reflection</p>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{reflection}</p>
              <p className="mt-4 text-xs text-paper/50">Reflection and support, not therapy.</p>
            </div>
          )}

          {/* History */}
          {entries.length > 0 && (
            <section className="mt-12 space-y-6">
              <h2 className="font-serif text-xl font-semibold text-paper">Past entries</h2>
              {entries.map((e) => (
                <article key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs text-paper/50">{new Date(e.created_at).toLocaleString()}</p>
                    <button
                      onClick={() => deleteEntry(e.id)}
                      className="text-xs uppercase tracking-[0.1em] text-paper/40 transition hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-paper/90">{e.body}</p>
                  {e.reading && (
                    <p className="mt-4 border-t border-white/10 pt-4 text-paper/80">{e.reading}</p>
                  )}
                </article>
              ))}
            </section>
          )}

          {entries.length === 0 && !reflection && (
            <p className="mt-12 text-center text-paper/40">
              Your journal is empty. Write your first entry above.
            </p>
          )}

          <p className="mt-12 text-center text-sm text-paper/40">
            Need support? <Link href="/support" className="text-mint underline">Crisis resources</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-mint/15 px-4 py-1.5 text-sm text-paper">
      <span className="text-mint">{label}</span> in {value}
    </span>
  );
}

function MeaningBlock({ type, sign }: { type: PlacementType; sign: string }) {
  const meaning = placementMeaning(type, sign);
  if (!meaning) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "#2ed79f" }}>
        {PLACEMENT_LABEL[type]} in {sign}
      </p>
      <p className="mt-1 text-xs" style={{ color: "#8c8295" }}>
        {PLACEMENT_INTRO[type]}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "#cdc5b1" }}>
        {meaning}
      </p>
    </div>
  );
}
