"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/story", label: "Our Story" },
];

export function Nav() {
  const [signedIn, setSignedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase!.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase!.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(27, 17, 51, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.080)" : "none",
      }}
    >
      <div className="container-x flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="Scorpio Rising"
            className="h-10 w-10 object-contain transition-all duration-300 group-hover:scale-105 constellation-glow"
          />
          <div className="flex flex-col leading-none">
            <span
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "0.75rem",
                fontWeight: 300,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#8f6f9c",
              }}
            >
              Scorpio
            </span>
            <span
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "1.1rem",
                fontStyle: "italic",
                fontWeight: 500,
                letterSpacing: "0.05em",
                color: "#ede8e0",
                marginTop: "-2px",
              }}
            >
              Rising
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.78rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94899c",
                transition: "color 200ms ease",
              }}
              className="hover:text-[#ede8e0]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {signedIn ? (
            <>
              <Link href="/journal" className="btn-ghost py-2 px-5 text-sm">
                Open Your Journal
              </Link>
              <Link href="/profile" className="btn-ghost py-2 px-5 text-sm">
                Profile
              </Link>
              <button
                onClick={() => supabase!.auth.signOut()}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-paper/60 transition hover:text-paper"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost py-2 px-5 text-sm">
                Sign In
              </Link>
              <Link href="/#pricing" className="btn-phosphor py-2 px-5 text-sm">
                Open Your Journal
              </Link>
            </>
          )}
        </div>

        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block h-px w-6 bg-[#ede8e0]" />
          <span className="block h-px w-6 bg-[#ede8e0]" />
          <span className="block h-px w-6 bg-[#ede8e0]" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="flex flex-col gap-5 px-6 py-6 md:hidden"
          style={{
            background: "rgba(27, 17, 51, 0.97)",
            borderTop: "1px solid rgba(255, 255, 255, 0.080)",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#d0c9bc",
              }}
            >
              {l.label}
            </Link>
          ))}
          {signedIn && (
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="btn-ghost mt-2 text-center">
              Profile
            </Link>
          )}
          <Link href="/#pricing" className="btn-phosphor mt-2 text-center">
            Open Your Journal
          </Link>
        </div>
      )}
    </header>
  );
}
