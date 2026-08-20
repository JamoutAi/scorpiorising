"use client";

import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { label: "Today", href: "/journal" },
  { label: "Journal", href: "/journal" },
  { label: "Patterns", href: "/patterns" },
  { label: "My Story", href: "/story" },
  { label: "My Chart", href: "/profile" },
];

export function Sidebar({
  email,
  name,
  onSignOut,
  active,
}: {
  email?: string;
  name?: string;
  onSignOut: () => void;
  active?: string;
}) {
  const initials = (name || email || "S").charAt(0).toUpperCase();
  return (
    <aside className="app-sidebar fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col p-5 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3" aria-label="Scorpio Rising home">
        <span className="h-9 w-9">
          <Logo />
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            className={`app-nav-link rounded-lg px-4 py-2.5 ${active === n.label ? "active" : ""}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="my-4 h-px" style={{ background: "rgba(244,241,234,0.08)" }} />
      <Link href="/ask" className="app-nav-link rounded-lg px-4 py-2.5" style={{ color: "#1fc896" }}>
        Ask Scorpio Rising
      </Link>

      <div className="mt-auto">
        <Link
          href="/journal"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1fc896] px-4 py-3 text-sm font-semibold text-[#072019]"
        >
          <span className="text-lg leading-none">+</span> Start a new entry
        </Link>
        <Link href="/profile" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm"
            style={{ background: "rgba(31,200,150,0.18)", color: "#1fc896" }}
          >
            {initials}
          </span>
          <span className="flex-1 truncate text-sm" style={{ color: "#f4f1ea" }}>
            {name || email}
          </span>
        </Link>
        <button onClick={onSignOut} className="app-nav-link mt-1 w-full rounded-lg px-4 py-2 text-left text-xs">
          Sign out
        </button>
      </div>
    </aside>
  );
}
