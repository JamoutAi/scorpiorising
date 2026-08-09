"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redir") || "/journal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [magic, setMagic] = useState(false);
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

    if (magic) {
      const { error } = await supabase!.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/journal` },
      });
      if (error) {
        setStatus("error");
        setMsg(error.message);
      } else {
        setStatus("sent");
      }
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: `${location.origin}/journal` },
      });
      if (error) {
        setStatus("error");
        setMsg(error.message);
        return;
      }
      if (data.session) {
        router.push("/journal");
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
      <div className="rounded-2xl border border-mint/30 bg-mint/10 p-6 text-paper">
        <p className="font-medium text-mint">Check your inbox.</p>
        <p className="mt-2 text-sm text-paper/80">{msg}</p>
        <Link href="/login" className="mt-4 inline-block text-sm text-mint underline">
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
      {!magic && (
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
        />
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-mint px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright disabled:opacity-60"
      >
        {status === "loading"
          ? "…"
          : magic
            ? "Email me a magic link"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
      </button>

      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}

      <button
        type="button"
        onClick={() => setMagic((m) => !m)}
        className="w-full text-center text-sm text-paper/60 underline"
      >
        {magic ? "Use password instead" : "Email me a magic link instead"}
      </button>

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
    <section className="relative flex min-h-[70vh] items-center justify-center bg-ink-deep px-5 py-16">
      <div className="starfield absolute inset-0 opacity-40" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo />
          <h1 className="mt-6 font-serif text-3xl font-bold text-paper">{title}</h1>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          {children}
        </div>
      </div>
    </section>
  );
}
