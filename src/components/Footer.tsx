export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/5 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-ink/60 md:flex-row">
        <span className="font-serif font-semibold text-ink">
          Scorpio <span className="text-ink-soft">Rising</span>
        </span>
        <nav className="flex flex-wrap items-center gap-6">
          <a href="/privacy" className="transition hover:text-ink">
            Privacy
          </a>
          <a href="/terms" className="transition hover:text-ink">
            Terms
          </a>
          <a href="/support" className="transition hover:text-ink">
            Support
          </a>
          <a
            href="https://scorpiorising.ai"
            className="transition hover:text-ink"
          >
            scorpiorising.ai
          </a>
        </nav>
        <span>© {year} Scorpio Rising</span>
      </div>
    </footer>
  );
}
