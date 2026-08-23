"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Sidebar } from "@/components/Sidebar";

type State = "loading" | "ready" | "upgrade" | "no_chart" | "error";

export default function ReadingPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [reading, setReading] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/reading");
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const { data } = await supabase!.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch("/api/daily-reading", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (res.status === 402) return setState("upgrade");
        if (json.error === "no_chart") return setState("no_chart");
        if (!res.ok || !json.reading) return setState("error");
        setReading(json.reading);
        setState("ready");
      } catch {
        setState("error");
      }
    })();
  }, [loading, user]);

  async function signOut() {
    await supabase!.auth.signOut();
    router.replace("/");
  }

  if (!configured || loading || !user) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#0c2a23", color: "#9bb3aa" }}>
          Opening the sky…
        </main>
      </>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar email={user.email ?? undefined} onSignOut={signOut} />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-3xl px-5 py-12">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>{today}</p>
          <h1 className="mt-1" style={{ fontFamily: "var(--font-display), serif", fontSize: "2rem", fontWeight: 300, color: "#17251f" }}>
            Your daily star reading
          </h1>

          <section className="card-cream mt-6 p-8">
            {state === "loading" && (
              <p style={{ color: "#7a756e" }}>Reading today&rsquo;s sky through your chart… this can take a moment.</p>
            )}
            {state === "ready" && (
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "#17251f" }}>{reading}</p>
            )}
            {state === "upgrade" && (
              <div className="text-center">
                <p style={{ color: "#17251f" }}>Daily readings are part of membership.</p>
                <Link href="/pricing" className="btn-phosphor mt-4 inline-block">See plans</Link>
              </div>
            )}
            {state === "no_chart" && (
              <div className="text-center">
                <p style={{ color: "#17251f" }}>Set your birth chart first — your daily reading is written through it.</p>
                <Link href="/journal" className="btn-phosphor mt-4 inline-block">Set my chart</Link>
              </div>
            )}
            {state === "error" && (
              <p style={{ color: "#7a756e" }}>
                The stars are quiet right now. Please try again in a moment, or{" "}
                <Link href="/support" className="underline" style={{ color: "#1aa37c" }}>contact support</Link>.
              </p>
            )}
          </section>

          <p className="mt-8 text-center text-sm" style={{ color: "#9a948b" }}>
            Reflection and guidance, not prediction. <Link href="/journal" className="underline" style={{ color: "#1aa37c" }}>Back to your journal</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
