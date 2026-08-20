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

export default function StoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/story");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase!.from("entries").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
      setEntries(data ?? []);
    })();
  }, [user]);

  if (!user) return null;

  // Group by month
  const groups: { label: string; items: Entry[] }[] = [];
  for (const e of entries) {
    const d = new Date(e.created_at);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    let g = groups.find((x) => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(e);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar email={user.email ?? undefined} onSignOut={() => { supabase!.auth.signOut().then(() => router.replace("/")); }} active="My Story" />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-4xl px-5 py-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>My Story</p>
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 300, color: "#17251f" }}>
              The chapters so far
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>
              Every entry you write becomes part of a continuous map of your life.
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="card-cream p-8 text-center">
              <p style={{ color: "#7a756e" }}>Your story starts with your first entry.</p>
              <button onClick={() => router.push("/journal")} className="btn-phosphor mt-5 inline-block">Start writing</button>
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map((g) => (
                <section key={g.label}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em]" style={{ background: "rgba(31,200,150,0.14)", color: "#1aa37c" }}>{g.label}</span>
                    <span className="h-px flex-1" style={{ background: "rgba(23,37,31,0.08)" }} />
                    <span className="text-xs" style={{ color: "#9a948b" }}>{g.items.length} {g.items.length === 1 ? "entry" : "entries"}</span>
                  </div>
                  <div className="space-y-4">
                    {g.items.map((e) => (
                      <article key={e.id} className="card-cream p-5">
                        <p className="mb-2 text-xs" style={{ color: "#9a948b" }}>{new Date(e.created_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                        <p className="whitespace-pre-wrap" style={{ color: "#17251f" }}>{e.body}</p>
                        {e.reading && (
                          <p className="mt-3 border-t pt-3 text-sm" style={{ borderColor: "rgba(23,37,31,0.08)", color: "#3a4a43" }}>{e.reading}</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
