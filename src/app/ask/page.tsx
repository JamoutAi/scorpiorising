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
interface Chat {
  id: string;
  title: string;
  messages: Msg[];
  updatedAt: number;
}

const STORAGE_KEY = "sr_chats";
const MAX_CHATS = 20;

function loadChats(): Chat[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveChats(chats: Chat[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, MAX_CHATS)));
}

export default function AskPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/ask");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      const c = loadChats();
      setChats(c);
      setActiveId(c[0]?.id ?? null);
    }
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, busy]);

  if (!user) return null;

  const active = chats.find((c) => c.id === activeId) || null;
  const messages = active?.messages ?? [];

  function persist(next: Chat[]) {
    setChats(next);
    saveChats(next);
  }

  function newChat() {
    if (chats.length >= MAX_CHATS) {
      // drop oldest
      const trimmed = chats.slice(0, MAX_CHATS - 1);
      persist(trimmed);
    }
    const id = `c_${Date.now()}`;
    const chat: Chat = { id, title: "New conversation", messages: [], updatedAt: Date.now() };
    persist([chat, ...chats].slice(0, MAX_CHATS));
    setActiveId(id);
    setErr(null);
  }

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setErr(null);

    // Ensure a chat exists
    let chat = active;
    let rest = chats;
    if (!chat) {
      const id = `c_${Date.now()}`;
      chat = { id, title: q.slice(0, 40), messages: [], updatedAt: Date.now() };
      rest = [chat, ...chats];
      setActiveId(id);
    }
    const history = chat.messages.map((m) => `${m.role === "you" ? "User" : "Scorpio Rising"}: ${m.text}`);
    const optimistic: Chat = {
      ...chat,
      title: chat.messages.length ? chat.title : q.slice(0, 40),
      messages: [...chat.messages, { role: "you", text: q }],
      updatedAt: Date.now(),
    };
    persist([optimistic, ...rest.filter((c) => c.id !== chat!.id)].slice(0, MAX_CHATS));
    setBusy(true);
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: q, history }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || "Something went wrong.");
        return;
      }
      const updated: Chat = {
        ...optimistic,
        messages: [...optimistic.messages, { role: "scorpio", text: json.answer }],
        updatedAt: Date.now(),
      };
      persist([updated, ...rest.filter((c) => c.id !== chat!.id)].slice(0, MAX_CHATS));
    } catch {
      setErr("The stars are quiet right now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function deleteChat(id: string) {
    const next = chats.filter((c) => c.id !== id);
    persist(next);
    setActiveId(next[0]?.id ?? null);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar email={user.email ?? undefined} onSignOut={() => { supabase!.auth.signOut().then(() => router.replace("/")); }} active="Ask" />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-5xl flex-col px-5 py-12 lg:flex-row lg:gap-6">
          {/* Conversation list */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:mb-0 lg:w-64 lg:flex-col lg:overflow-y-auto">
            <button onClick={newChat} className="btn-phosphor shrink-0 px-4 py-2 text-sm">
              + New chat
            </button>
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className="shrink-0 rounded-xl border px-3 py-2 text-left text-sm lg:w-full"
                style={{
                  borderColor: c.id === activeId ? "rgba(31,200,150,0.5)" : "rgba(23,37,31,0.1)",
                  background: c.id === activeId ? "rgba(31,200,150,0.10)" : "transparent",
                  color: "#17251f",
                }}
              >
                <span className="block truncate">{c.title || "New conversation"}</span>
                <span className="text-xs" style={{ color: "#9a948b" }}>{c.messages.length} messages</span>
              </button>
            ))}
            {chats.length >= MAX_CHATS && (
              <p className="shrink-0 px-1 text-xs" style={{ color: "#9a948b" }}>Max {MAX_CHATS} chats — oldest is removed as you add more.</p>
            )}
          </div>

          {/* Chat panel */}
          <div className="flex flex-1 flex-col rounded-2xl border p-5" style={{ borderColor: "rgba(23,37,31,0.1)", background: "#fffdf8" }}>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#1aa37c" }}>Ask Scorpio Rising</p>
              <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>
                Your stars, your questions
              </h1>
              <p className="text-sm" style={{ color: "#7a756e" }}>
                Ask about your chart, horoscopes, transits, and the sky. I stay within astrology.
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {messages.length === 0 && (
                <div className="rounded-xl p-4" style={{ background: "rgba(31,200,150,0.08)" }}>
                  <p style={{ color: "#17251f" }}>Try: &ldquo;What does my Scorpio rising say about me?&rdquo; or &ldquo;What transit is hitting my Moon right now?&rdquo;</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "you" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className="max-w-[85%] rounded-2xl p-4"
                    style={m.role === "you" ? { background: "#1fc896", color: "#072019" } : { background: "#0c2a23", color: "#f4f1ea" }}
                  >
                    {m.role === "scorpio" && (
                      <p className="mb-1 text-xs uppercase tracking-[0.18em]" style={{ color: "#1fc896" }}>Scorpio Rising</p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl p-4" style={{ background: "#0c2a23", color: "#9bb3aa" }}>
                    <p className="text-sm">Reading your stars…</p>
                  </div>
                </div>
              )}
              {err && (
                <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(176,90,58,0.1)", color: "#b05a3a" }}>
                  {err}
                  {active && (
                    <button onClick={() => deleteChat(active.id)} className="ml-3 underline">Dismiss</button>
                  )}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                placeholder="Ask about your stars…"
                className="paper-input w-full px-4 py-3"
              />
              <button type="submit" disabled={busy || !input.trim()} className="btn-phosphor shrink-0">
                Ask
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
