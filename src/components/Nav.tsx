import Link from "next/link";
import { Logo } from "./Logo";

export function Nav() {
  const links = [
    { href: "/#how", label: "How it works" },
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/story", label: "Our story" },
  ];
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
          <Link
            href="/reading"
            className="hidden rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-paper/80 transition hover:border-white/60 hover:text-paper sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/reading"
            className="rounded-full bg-mint px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright"
          >
            Open your journal
          </Link>
        </div>
      </nav>
    </header>
  );
}
