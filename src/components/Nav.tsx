"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { tapHaptic } from "@/lib/native";

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#our-story", label: "Our Story" },
];

export function Nav() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    tapHaptic();
    setMenuOpen(false);
    await supabase!.auth.signOut();
    // Home sends the iOS app on to the sign-up screen; on the web it is the landing page.
    router.replace("/");
  }

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
        background: scrolled ? "rgba(8, 32, 26, 0.92)" : "rgba(12, 42, 35, 0.55)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(31, 200, 150, 0.18)" : "1px solid rgba(244, 241, 234, 0.04)",
      }}
    >
      <div className="container-x flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="Scorpio Rising"
            className="h-14 w-14 object-contain transition-all duration-300 group-hover:scale-105 constellation-glow"
          />
          <div className="flex flex-col leading-none">
            <span
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "0.75rem",
                fontWeight: 300,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#1fc896",
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
                color: "#f4f1ea",
                marginTop: "-2px",
              }}
            >
              Rising
            </span>
          </div>
        </Link>

        {/* Marketing links need ~1100px next to the signed-in buttons; below xl they live in the menu. */}
        <nav className="hidden items-center gap-8 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.82rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#c9d3cd",
                transition: "color 200ms ease",
              }}
              className="hover:text-[#1fc896]"
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
                onClick={signOut}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-paper/60 transition hover:text-paper"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/start-trial" className="btn-ghost py-2 px-5 text-sm">
                Sign In
              </Link>
              <Link href="/start-trial" className="btn-phosphor py-2 px-5 text-sm">
                Open Your Journal
              </Link>
            </>
          )}
        </div>

        <button
          className="flex flex-col gap-1.5 p-2 xl:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block h-px w-6 bg-[#f4f1ea]" />
          <span className="block h-px w-6 bg-[#f4f1ea]" />
          <span className="block h-px w-6 bg-[#f4f1ea]" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="flex flex-col gap-5 px-6 py-6 xl:hidden"
          style={{
            background: "rgba(8, 32, 26, 0.97)",
            borderTop: "1px solid rgba(244, 241, 234, 0.080)",
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
          {/* Account actions: in the menu on phones, in the header bar from md up. */}
          <div className="flex flex-col gap-5 md:hidden">
            {signedIn ? (
              <>
                <Link href="/journal" onClick={() => setMenuOpen(false)} className="btn-phosphor mt-2 text-center">
                  Open Your Journal
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="btn-ghost text-center">
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-paper/60 transition hover:text-paper"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/start-trial" onClick={() => setMenuOpen(false)} className="btn-ghost mt-2 text-center">
                  Sign In
                </Link>
                <Link href="/start-trial" onClick={() => setMenuOpen(false)} className="btn-phosphor text-center">
                  Open Your Journal
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
