"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";

interface Entry {
  id: string;
  body: string;
  created_at: string;
  reading: string | null;
}

// Theme lexicon — words that map to a recurring-life theme.
const THEMES: { key: string; words: string[] }[] = [
  { key: "Work & career", words: ["job", "work", "boss", "career", "quit", "quitting", "promotion", "office", "burnout", "layoff", "business", "client", "money", "finance"] },
  { key: "Boundaries", words: ["boundary", "boundaries", "no", "say no", "people-please", "please", "respect", "taken", "used", "guilt"] },
  { key: "Relationships", words: ["partner", "boyfriend", "girlfriend", "husband", "wife", "ex", "dating", "relationship", "love", "marriage", "divorce", "friend", "family", "mom", "dad", "mother", "father"] },
  { key: "Self & identity", words: ["who am i", "identity", "myself", "self", "worth", "confident", "confidence", "enough", "purpose", "meaning"] },
  { key: "Rest & health", words: ["tired", "exhausted", "sleep", "rest", "anxious", "anxiety", "stress", "overwhelm", "health", "sick", "calm", "peace"] },
  { key: "Change & fear", words: ["change", "afraid", "scared", "fear", "risk", "uncertain", "stuck", "transition", "moving", "leave", "leaving"] },
  { key: "Joy & creativity", words: ["happy", "joy", "excited", "grateful", "creative", "art", "music", "fun", "proud", "hope"] },
];

export default function PatternsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/patterns");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase!.from("entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setEntries(data ?? []);
      setLoaded(true);
    })();
  }, [user]);

  if (!user) return null;

  // Compute theme counts
  const themeCounts = THEMES.map((t) => {
    const count = entries.filter((e) => {
      const text = (e.body + " " + (e.reading || "")).toLowerCase();
      return t.words.some((w) => text.includes(w));
    }).length;
    return { key: t.key, count };
  }).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

  const max = themeCounts.length ? themeCounts[0].count : 1;

  // Mood trend: crude positive/negative split over time
  const POS = ["happy", "joy", "grateful", "excited", "proud", "calm", "peace", "hope", "love", "good", "better"];
  const NEG = ["sad", "anxious", "stress", "tired", "exhausted", "scared", "afraid", "overwhelm", "angry", "hurt", "lonely", "bad", "worse"];
  const trend = [...entries].reverse().map((e) => {
    const t = e.body.toLowerCase();
    const pos = POS.filter((w) => t.includes(w)).length;
    const neg = NEG.filter((w) => t.includes(w)).length;
    return { date: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), score: pos - neg };
  });

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar email={user.email ?? undefined} onSignOut={() => { supabase!.auth.signOut().then(() => router.replace("/")); }} active="Patterns" />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-4xl px-5 py-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>Patterns</p>
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 300, color: "#17251f" }}>
              WhatScorpio Rising notices
            </h1>
          </div>

          {entries.length === 0 ? (
            <div className="card-cream p-8 text-center">
              <p style={{ color: "#7a756e" }}>No entries yet. Write a few reflections and your patterns will appear here.</p>
              <button onClick={() => router.push("/journal")} className="btn-phosphor mt-5 inline-block">Start writing</button>
            </div>
          ) : (
            <>
              {/* Theme frequency */}
              <section className="card-cream mb-6 p-7">
                <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#17251f" }}>Recurring themes</h2>
                <p className="mb-5 text-sm" style={{ color: "#7a756e" }}>Across {entries.length} {entries.length === 1 ? "entry" : "entries"}.</p>
                <div className="space-y-4">
                  {themeCounts.map((t) => (
                    <div key={t.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span style={{ color: "#17251f" }}>{t.key}</span>
                        <span style={{ color: "#7a756e" }}>{t.count} {t.count === 1 ? "entry" : "entries"}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full" style={{ background: "rgba(23,37,31,0.06)" }}>
                        <div className="h-2.5 rounded-full" style={{ width: `${Math.max(8, (t.count / max) * 100)}%`, background: "#1fc896" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mood trend */}
              <section className="card-cream p-7">
                <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.5rem", fontWeight: 300, color: "#17251f" }}>Emotional trend</h2>
                <p className="mb-5 text-sm" style={{ color: "#7a756e" }}>Rough balance of bright vs heavy words over time.</p>
                <div className="flex items-end gap-1.5" style={{ height: "120px" }}>
                  {trend.map((d, i) => {
                    const h = 30 + Math.abs(d.score) * 22;
                    const pos = d.score >= 0;
                    return (
                      <div key={i} className="flex-1 rounded-t" title={`${d.date}: ${d.score >= 0 ? "+" : ""}${d.score}`} style={{ height: `${h}px`, background: pos ? "rgba(31,200,150,0.55)" : "rgba(197,164,107,0.5)" }} />
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs" style={{ color: "#9a948b" }}>
                  <span>{trend[0]?.date}</span>
                  <span>{trend[trend.length - 1]?.date}</span>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
