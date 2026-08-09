"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export function Nav() {
  const links = [
    { href: "/#how", label: "How it works" },
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/story", label: "Our story" },
  ];
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase!.auth.getSession().then(({ data }) =>
      setSignedIn(!!data.session),
    );
    const { data: sub } = supabase!.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-paper/70 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-paper">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              <Link
                href="/journal"
                className="rounded-full bg-mint px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright"
              >
                Open your journal
              </Link>
              <button
                onClick={() => supabase!.auth.signOut()}
                className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-paper/60 transition hover:text-paper sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-paper/80 transition hover:border-white/60 hover:text-paper sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/#pricing"
                className="rounded-full bg-mint px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright"
              >
                Start free trial
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
