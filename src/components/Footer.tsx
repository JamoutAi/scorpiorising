export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-ink-deep">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-paper/60 md:flex-row">
        <span className="font-serif font-semibold text-paper">
          SCORPIO <span className="text-mint">Rising</span>
        </span>
        <nav className="flex flex-wrap items-center gap-6">
          <a href="/privacy" className="transition hover:text-paper">
            Privacy
          </a>
          <a href="/terms" className="transition hover:text-paper">
            Terms
          </a>
          <a href="/support" className="transition hover:text-paper">
            Support
          </a>
          <a
            href="https://scorpiorising.ai"
            className="transition hover:text-paper"
          >
            scorpiorising.ai
          </a>
        </nav>
        <span>© {year} Scorpio Rising</span>
      </div>
    </footer>
  );
}
