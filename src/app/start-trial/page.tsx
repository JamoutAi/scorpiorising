"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export default function StartTrial() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "form">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase!.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        startCheckout();
      } else {
        setMode("form");
      }
    });
  }, []);

  async function startCheckout() {
    setBusy(true);
    setMsg("Taking you to checkout…");
    try {
      const { data } = await supabase!.auth.getSession();
      const userId = data.session?.user.id ?? null;
      const userEmail = data.session?.user.email ?? null;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing: "monthly", userId, email: userEmail }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      setMsg(json.error || "Could not start checkout. Please contact support.");
      setMode("form");
      setBusy(false);
    } catch {
      setMsg("Something went wrong. Please try again or contact support.");
      setMode("form");
      setBusy(false);
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setMsg("");
    const { data, error } = await supabase!.auth.signUp({ email, password });
    if (error) {
      // If the account exists, try to sign in instead.
      const login = await supabase!.auth.signInWithPassword({ email, password });
      if (login.error) {
        setMsg(error.message);
        setBusy(false);
        return;
      }
      startCheckout();
      return;
    }
    if (data.session) {
      startCheckout();
    } else {
      setMsg("Check your email to confirm your account, then start your trial.");
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return (
      <>
        <Nav />
        <main className="flex-1 px-5 py-24 text-center" style={{ background: "#0c2a23", color: "#9bb3aa" }}>
          Starting your free trial…
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="flex min-h-screen items-center justify-center px-5 py-24" style={{ background: "#0c2a23" }}>
        <div className="card-cream w-full max-w-md p-10 text-center">
          <div className="mx-auto mb-6 w-32">
            <Logo tone="dark" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.9rem", fontWeight: 300, color: "#17251f" }}>
            Your 7-day free trial
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>
            Create your account, then add your payment details in Stripe. You won&rsquo;t be charged for 7 days.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="paper-input w-full px-4 py-3"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="paper-input w-full px-4 py-3"
            />
            <button type="submit" disabled={busy} className="btn-phosphor w-full">
              {busy ? "One moment…" : "Continue to checkout"}
            </button>
          </form>
          {msg && <p className="mt-4 text-sm" style={{ color: "#1aa37c" }}>{msg}</p>}
          <p className="mt-6 text-xs" style={{ color: "#9a948b" }}>
            Already have an account?{" "}
            <button onClick={() => router.push("/login?redir=/start-trial")} className="underline" style={{ color: "#1fc896" }}>
              Sign in
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
