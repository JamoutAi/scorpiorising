"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redir") || "/journal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-paper/80">
        Sign-in isn&rsquo;t configured yet. Add your Supabase keys in the
        dashboard, then run the schema SQL.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    if (mode === "signup") {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: "https://www.scorpiorising.ai/journal" },
      });
      if (error) {
        setStatus("error");
        setMsg(error.message);
        return;
      }
      if (data.session) {
        // Logged in immediately (confirm-email off): continue to the purchase
        // flow the user came from (e.g. /pricing) instead of skipping the plan.
        router.push(redirectTo);
      } else {
        setStatus("sent");
        setMsg("Check your email to confirm your account, then sign in.");
      }
    } else {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("error");
        setMsg(error.message);
        return;
      }
      router.push(redirectTo);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border p-6" style={{ borderColor: "rgba(46,215,159,0.3)", background: "rgba(46,215,159,0.1)" }}>
        <p className="font-medium" style={{ color: "#2ed79f" }}>Check your inbox.</p>
        <p className="mt-2 text-sm" style={{ color: "#cdc5b1" }}>{msg}</p>
        <p className="mt-3 text-xs" style={{ color: "#8c8295" }}>
          Email slow or not arriving? Wait ~60s and try the magic-link option below, or sign in with a password.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm underline" style={{ color: "#2ed79f" }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@stars.com"
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
      />
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min 6 characters)"
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-phosphor w-full"
      >
        {status === "loading"
          ? "…"
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </button>

      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}

      <p className="text-center text-sm text-paper/60">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-mint underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-mint underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function AuthShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center px-5 py-16"
      style={{ background: "#15102b", backgroundImage: "url(/assets/constellation-texture.jpg)", backgroundSize: "cover", backgroundBlendMode: "overlay" }}
    >
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(21,16,43,0.92), rgba(15,10,37,0.92))" }} />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Scorpio Rising" className="mx-auto h-20 w-20 object-contain constellation-glow" />
          <h1
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "2.2rem",
              fontWeight: 300,
              color: "#f0ebe2",
              marginTop: "1.25rem",
            }}
          >
            {title}
          </h1>
        </div>
        <div className="card-vellum p-8">{children}</div>
      </div>
    </section>
  );
}
