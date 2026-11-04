"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/AuthForm";
import { PasswordInput } from "@/components/PasswordInput";

/**
 * Set a new password. Three ways in:
 *  1. The email link carries ?token_hash=…&type=recovery (our email template).
 *     We verify it only when the form is submitted, so an email scanner that
 *     pre-opens the link cannot burn the one-time token.
 *  2. A classic Supabase link that already created a session (#access_token…).
 *  3. The link bounced here with #error=…: explain, and offer a fresh link.
 */
export default function ResetPage() {
  return (
    <AuthShell title="Reset your password">
      <Suspense fallback={<p className="text-sm" style={{ color: "#cdc5b1" }}>Opening your reset link…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenHash = params.get("token_hash");
  const [mode, setMode] = useState<"checking" | "form" | "expired" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const hash = window.location.hash || "";
    let settled = false;
    if (tokenHash || /error_code=|error=access_denied/.test(hash)) {
      settled = true;
      // Decided from the URL alone; deferred so the state change happens outside the effect body.
      queueMicrotask(() => setMode(tokenHash ? "form" : "expired"));
      return;
    }
    // Classic link: Supabase put the session in the URL and the client picked it up.
    const { data: sub } = supabase!.auth.onAuthStateChange((event, session) => {
      if (settled) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        settled = true;
        setMode("form");
      }
    });
    supabase!.auth.getSession().then(({ data }) => {
      if (settled) return;
      if (data.session) {
        settled = true;
        setMode("form");
      } else {
        // Give the URL-hash exchange a moment before declaring the link dead.
        setTimeout(() => {
          if (!settled) {
            settled = true;
            setMode("expired");
          }
        }, 1500);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [tokenHash]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Those two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      if (tokenHash) {
        const { error } = await supabase!.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        if (error) {
          setMode("expired");
          setBusy(false);
          return;
        }
      }
      const { error } = await supabase!.auth.updateUser({ password });
      if (error) {
        setMsg(error.message);
        setBusy(false);
        return;
      }
      setMode("done");
      setTimeout(() => router.replace("/journal"), 1200);
    } catch {
      setMsg("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  async function sendNewLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.scorpiorising.ai/reset",
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setSent(true);
  }

  if (mode === "checking") {
    return <p className="text-sm" style={{ color: "#cdc5b1" }}>Opening your reset link…</p>;
  }

  if (mode === "done") {
    return (
      <p className="text-sm" style={{ color: "#2ed79f" }}>
        Password updated. Taking you to your journal…
      </p>
    );
  }

  if (mode === "expired") {
    if (sent) {
      return (
        <div className="rounded-2xl border p-6" style={{ borderColor: "rgba(46,215,159,0.3)", background: "rgba(46,215,159,0.1)" }}>
          <p className="font-medium" style={{ color: "#2ed79f" }}>Check your inbox.</p>
          <p className="mt-2 text-sm" style={{ color: "#cdc5b1" }}>
            A fresh reset link is on its way. Open it on this device and set your new password.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm underline" style={{ color: "#2ed79f" }}>
            Back to sign in
          </Link>
        </div>
      );
    }
    return (
      <form onSubmit={sendNewLink} className="space-y-4">
        <p className="text-sm" style={{ color: "#cdc5b1" }}>
          That reset link has expired or was already used. Enter your email and we&rsquo;ll send a new one.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@stars.com"
          className={inputClass}
        />
        {msg && <p className="text-sm text-red-400">{msg}</p>}
        <button type="submit" disabled={busy} className="btn-phosphor w-full">
          {busy ? "…" : "Send a new link"}
        </button>
        <p className="text-center text-sm text-paper/60">
          <Link href="/login" className="text-mint underline">Back to sign in</Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="New password (min 6 characters)"
        className={inputClass}
        minLength={6}
        autoComplete="new-password"
      />
      <PasswordInput
        value={confirm}
        onChange={setConfirm}
        placeholder="Type it again"
        className={inputClass}
        minLength={6}
        autoComplete="new-password"
      />
      {msg && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={busy} className="btn-phosphor w-full">
        {busy ? "…" : "Set new password"}
      </button>
    </form>
  );
}
