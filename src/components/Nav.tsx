import Link from "next/link";

export function Nav() {
  const links = [
    { href: "/#how", label: "How it works" },
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/story", label: "Our story" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight text-ink">
            Scorpio <span className="text-ink-soft">Rising</span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-ink/70 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/reading"
            className="hidden text-sm font-medium text-ink-soft transition hover:text-ink sm:block"
          >
            Get your reading
          </Link>
          <Link
            href="/reading"
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft"
          >
            Open your journal
          </Link>
        </div>
      </nav>
    </header>
  );
}
