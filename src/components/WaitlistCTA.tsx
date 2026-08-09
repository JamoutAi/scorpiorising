"use client";

import { useState } from "react";

export function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("done");
        setMsg("You're on the list. We'll be in touch under the next moon.");
      } else {
        setStatus("error");
        setMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <section className="bg-ink-deep py-24">
      <div className="mx-auto max-w-xl px-5 text-center">
        <h2 className="font-serif text-3xl font-bold text-paper">
          Your rising sign is your story. This is where you write it.
        </h2>
        <p className="mt-4 text-paper/70">
          Join the waitlist for early access — or skip the line and get your
          free first reading now.
        </p>
        {status === "done" ? (
          <p className="mt-8 rounded-full border border-mint/30 bg-mint/15 px-6 py-4 font-medium text-mint">
            {msg}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@stars.com"
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-mint px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright disabled:opacity-60"
            >
              {status === "loading" ? "Joining…" : "Join the waitlist"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-400">{msg}</p>
        )}
        <p className="mt-4 text-xs text-paper/50">
          Free to start · No spam, only the stars.
        </p>
      </div>
    </section>
  );
}
