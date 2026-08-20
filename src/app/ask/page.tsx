"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";

interface Msg {
  role: "you" | "scorpio";
  text: string;
}

export default function AskPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/ask");
  }, [loading, user, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  if (!user) return null;

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setErr(null);
    setMsgs((m) => [...m, { role: "you", text: q }]);
    setBusy(true);
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || "Something went wrong.");
        setMsgs((m) => m.slice(0, -1));
        return;
      }
      setMsgs((m) => [...m, { role: "scorpio", text: json.answer }]);
    } catch {
      setErr("The stars are quiet right now. Try again in a moment.");
      setMsgs((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar email={user.email ?? undefined} onSignOut={() => { supabase!.auth.signOut().then(() => router.replace("/")); }} active="Ask" />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col px-5 py-12">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>Ask Scorpio Rising</p>
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 300, color: "#17251f" }}>
              Talk to your whole story
            </h1>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {msgs.length === 0 && (
              <div className="card-cream p-6">
                <p style={{ color: "#17251f" }}>
                  Ask anything about your life, your patterns, or your chart.
                </p>
                <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>
                  Try: &ldquo;When did I first start writing about quitting my job?&rdquo; or &ldquo;What theme keeps repeating in my journal?&rdquo;
                </p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "you" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="max-w-[85%] rounded-2xl p-5"
                  style={
                    m.role === "you"
                      ? { background: "#1fc896", color: "#072019" }
                      : { background: "#0c2a23", color: "#f4f1ea" }
                  }
                >
                  {m.role === "scorpio" && (
                    <p className="mb-2 text-xs uppercase tracking-[0.18em]" style={{ color: "#1fc896" }}>Scorpio Rising</p>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl p-5" style={{ background: "#0c2a23", color: "#9bb3aa" }}>
                  <p className="text-sm">Reading your stars…</p>
                </div>
              </div>
            )}
            {err && <p className="text-sm" style={{ color: "#b05a3a" }}>{err}</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="mt-3 flex items-end gap-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={2}
              placeholder="Ask Scorpio Rising…"
              className="paper-input w-full px-4 py-3"
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-phosphor shrink-0">
              Ask
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
