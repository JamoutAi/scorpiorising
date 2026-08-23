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
import { EntryCard } from "@/components/EntryCard";

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

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchEntries(userId: string): Promise<Entry[]> {
  const { data } = await supabase!
    .from("entries")
    .select("id, body, created_at, readings(content)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id,
    body: r.body,
    created_at: r.created_at,
    reading: r.readings?.[0]?.content ?? null,
  }));
}

export default function JournalPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [freeLimit, setFreeLimit] = useState(false);
  const [freeLimitMsg, setFreeLimitMsg] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [name, setName] = useState("");
  const [formMsg, setFormMsg] = useState("");

  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState<string | null>(null);
  const [entryMsg, setEntryMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/profile");
  }, [loading, user, router]);

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

      const e = await fetchEntries(user.id);
      setEntries(e);

      const isActive =
        p?.plan_status === "active" || p?.plan_status === "trialing";
      if (!isActive && e.length >= 1) {
        setFreeLimit(true);
        setFreeLimitMsg(
          "You've had your first free reflection. Become a member to keep writing — it's $16.99/month or $79.99/year."
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
        headers: await authHeaders(),
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
    setEntryMsg("");
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ action: "addEntry", entry }),
      });
      const json = await res.json();
      if (res.status === 402) {
        setFreeLimit(true);
        setFreeLimitMsg(
          json.message || "You've used your free reflection — become a member to keep writing."
        );
        return;
      }
      if (!res.ok) {
        throw new Error(
          json.error === "auth_required"
            ? "Your session has expired — please sign in again."
            : json.error || "Could not save your entry."
        );
      }
      setReflection(json.reading ?? "Saved. Your reflection will appear shortly.");
      setEntry("");
      setEntries(await fetchEntries(user.id));
    } catch (err: any) {
      setEntryMsg(err?.message || "Something went wrong saving your entry. Please try again.");
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
          Sign-in isn’t configured yet. Add the Supabase keys in Vercel and run the schema SQL.
        </main>
        <Footer />
      </>
    );
  }

  if (loading || (!user && !loaded)) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#0c2a23", color: "#9bb3aa" }}>
          Opening your journal…
        </main>
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
        <div className="mx-auto max-w-3xl px-5 py-12">
          {/* Mobile header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.8rem", fontWeight: 300, color: "#17251f" }}>Your Journal</h1>
            <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full text-sm" style={{ background: "rgba(31,200,150,0.18)", color: "#1fc896" }}>
              {(profile?.name || user.email || "S").charAt(0).toUpperCase()}
            </Link>
          </div>

          {/* Chart setup (first run only) */}
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
              {/* Writing space */}
              <section className="card-cream p-6">
                <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>
                  Write
                </h2>
                <p className="mb-4 mt-1 text-sm" style={{ color: "#7a756e" }}>
                  What's on your mind and in your heart? Scorpio Rising reflects it back through your chart.
                </p>
                <p className="mb-4 text-xs" style={{ color: "#9a948b" }}>
                  Your entries are private to your account, but they are not legally privileged — avoid writing anything you wouldn&rsquo;t want disclosed in a legal matter.
                </p>
                <form onSubmit={submitEntry}>
                  <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={8}
                    disabled={freeLimit}
                    className="paper-input w-full px-5 py-4 text-lg disabled:opacity-50"
                    style={{ fontFamily: "var(--font-display), serif", minHeight: "220px", resize: "vertical" }}
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button type="submit" disabled={busy || !entry.trim() || freeLimit} className="btn-phosphor">
                      {busy ? "Reflecting…" : "Write"}
                    </button>
                    {freeLimit ? (
                      <span className="text-xs" style={{ color: "#1aa37c" }}>Free reflection used — upgrade to keep writing.</span>
                    ) : busy ? (
                      <span className="text-xs" style={{ color: "#7a756e" }}>Reading your stars — up to a minute.</span>
                    ) : null}
                  </div>
                </form>
                {entryMsg && (
                  <p className="mt-3 text-sm" style={{ color: "#b3261e" }}>{entryMsg}</p>
                )}
                {reflection && (
                  <div className="mt-6 border-t pt-5" style={{ borderColor: "rgba(23,37,31,0.08)" }}>
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>Your reflection</p>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: "#17251f" }}>{reflection}</p>
                    <p className="mt-3 text-xs" style={{ color: "#9a948b" }}>Reflection and support, not therapy.</p>
                  </div>
                )}
              </section>

              {freeLimit && (
                <div className="card-cream mt-6 border border-[#1fc896]/40 p-8 text-center">
                  <p style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Your free reflection is complete.</p>
                  <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "#7a756e" }}>{freeLimitMsg}</p>
                  <Link href="/pricing" className="btn-phosphor mt-6 inline-block">See plans &amp; upgrade</Link>
                </div>
              )}

              {/* Past entries — collapsible */}
              {entries.length > 0 && (
                <section className="mt-10">
                  <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.4rem", fontWeight: 300, color: "#17251f", marginBottom: "0.75rem" }}>
                    Past entries
                  </h2>
                  <div className="space-y-3">
                    {entries.map((e) => (
                      <div key={e.id} className="relative">
                        <EntryCard createdAt={e.created_at} body={e.body} reading={e.reading} />
                        <button
                          onClick={() => deleteEntry(e.id)}
                          className="absolute right-3 top-3 z-10 text-xs uppercase tracking-[0.1em] transition hover:text-red-500"
                          style={{ color: "#b0a99f" }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
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
