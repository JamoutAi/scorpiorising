"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const NAV = [
  { label: "Today", href: "/journal" },
  { label: "Journal", href: "/journal" },
  { label: "Patterns", href: "/patterns" },
  { label: "My Story", href: "/story" },
  { label: "My Chart", href: "/profile" },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [planInfo, setPlanInfo] = useState<string>("Checking…");
  const [isMember, setIsMember] = useState(false);
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
          setIsMember(true);
          setPlanInfo("Member");
        } else if (data.profile?.plan_status === "active" || data.profile?.plan_status === "trialing") {
          setIsMember(true);
          setPlanInfo("Member");
        } else {
          setPlanInfo("Free / no active plan");
        }
      } catch {
        setPlanInfo(data.profile?.plan_status === "active" ? "Member" : "Free / no active plan");
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
      else if (res.status === 402) setDailyErr("Daily star readings are included with membership. Become a member to unlock.");
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
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />

      {/* Forest sidebar */}
      <aside className="app-sidebar fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col p-5 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="h-9 w-9"><Logo /></span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="app-nav-link rounded-lg px-4 py-2.5">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="my-4 h-px" style={{ background: "rgba(244,241,234,0.08)" }} />
        <Link href="/ask" className="app-nav-link rounded-lg px-4 py-2.5" style={{ color: "#1fc896" }}>
          Ask Scorpio Rising
        </Link>
        <div className="mt-auto">
          <Link href="/journal" className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1fc896] px-4 py-3 text-sm font-semibold text-[#072019]">
            <span className="text-lg leading-none">+</span> Start a new entry
          </Link>
          <Link href="/profile" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm" style={{ background: "rgba(31,200,150,0.18)", color: "#1fc896" }}>
              {(profile?.name || user.email || "S").charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 truncate text-sm" style={{ color: "#f4f1ea" }}>{profile?.name || user.email}</span>
          </Link>
          <button onClick={async () => { await supabase!.auth.signOut(); router.replace("/"); }} className="app-nav-link mt-1 w-full rounded-lg px-4 py-2 text-left text-xs">Sign out</button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-3xl px-5 py-12">
          {/* Mobile header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.8rem", fontWeight: 300, color: "#17251f" }}>Your Profile</h1>
            <Link href="/journal" className="btn-phosphor px-4 py-2 text-sm">Journal</Link>
          </div>

          {/* Birth chart */}
          <section className="card-cream mb-6 p-7">
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#17251f" }}>
              Your birth chart
            </h2>
            {profile?.chart ? (
              <div className="flex flex-wrap gap-2">
                <Chip label="Sun" value={profile.chart.sun} />
                <Chip label="Moon" value={profile.chart.moon} />
                <Chip label="Rising" value={profile.chart.rising} />
                {profile.chart.risingApprox && (
                  <span className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(23,37,31,0.06)", color: "#7a756e" }}>
                    Rising approximate
                  </span>
                )}
              </div>
            ) : (
              <p style={{ color: "#7a756e" }}>No chart set yet.</p>
            )}
            <button onClick={() => router.push("/journal")} className="btn-ghost mt-4" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#1aa37c" }}>
              Show me my chart
            </button>
          </section>

          {/* Daily star reading (member) */}
          <section className="card-cream mb-6 p-7">
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#17251f" }}>
              Your daily star reading
            </h2>
            <p className="mb-4 text-sm" style={{ color: "#7a756e" }}>
              A general reading of today&rsquo;s sky moving through your chart. Included in every membership.
            </p>
            <button onClick={showStars} disabled={dailyBusy} className="btn-phosphor">
              {dailyBusy ? "Reading the sky…" : "Show me the stars"}
            </button>
            {dailyBusy && (
              <p className="mt-3 text-xs" style={{ color: "#7a756e" }}>
                Reading your stars — this can take up to a minute.
              </p>
            )}
            {dailyErr && (
              <p className="mt-4 rounded-xl border p-4 text-sm" style={{ borderColor: "rgba(31,200,150,0.25)", color: "#17251f", background: "rgba(31,200,150,0.08)" }}>
                {dailyErr}
                {!isMember && (
                  <button onClick={() => router.push("/pricing")} className="btn-ghost ml-3 mt-2" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#1aa37c" }}>
                    Become a member
                  </button>
                )}
              </p>
            )}
            {daily && (
              <div className="mt-5 rounded-2xl border p-6" style={{ borderColor: "rgba(23,37,31,0.08)", background: "#fffdf8" }}>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: "#17251f" }}>
                  {daily}
                </p>
                <p className="mt-4 text-xs" style={{ color: "#9a948b" }}>
                  Reflection and support, not therapy.
                </p>
              </div>
            )}
          </section>

          {/* Past entries */}
          <section className="card-cream p-7">
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#17251f" }}>
              Past entries ({entries.length})
            </h2>
            {entries.length === 0 ? (
              <p style={{ color: "#7a756e" }}>No entries yet. Your reflections live in your journal.</p>
            ) : (
              <div className="space-y-4">
                {entries.map((e) => (
                  <article key={e.id} className="rounded-2xl border p-5" style={{ borderColor: "rgba(23,37,31,0.08)", background: "#fffdf8" }}>
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
                      <p className="mt-3 border-t pt-3 text-sm" style={{ borderColor: "rgba(23,37,31,0.08)", color: "#3a4a43" }}>
                        {e.reading}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
            <button onClick={() => router.push("/journal")} className="btn-ghost mt-5" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#1aa37c" }}>
              Open your journal
            </button>
          </section>

          {/* Plan — at the bottom */}
          <section className="card-cream mt-6 p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>
                  Plan
                </p>
                <p className="mt-1" style={{ fontSize: "1.4rem", color: "#17251f" }}>
                  {planInfo}
                </p>
                {profile?.email && (
                  <p className="mt-1 text-sm" style={{ color: "#7a756e" }}>
                    {profile.email}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {!isMember && (
                  <button onClick={() => router.push("/pricing")} className="btn-phosphor">
                    Become a member
                  </button>
                )}
                <button onClick={manageBilling} disabled={busy} className="btn-ghost" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#17251f" }}>
                  {busy ? "Opening…" : "Manage billing"}
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs" style={{ color: "#9a948b" }}>
              Upgrade, cancel, or update your payment method via Stripe.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full px-4 py-2 text-sm" style={{ background: "rgba(31,200,150,0.14)", color: "#17251f" }}>
      <span style={{ color: "#1aa37c" }}>{label}: </span>
      {value}
    </span>
  );
}
