import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="starfield absolute inset-0 opacity-60" />
      <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-mint">
          AI Journaling · Astrological Intelligence
        </p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl">
          You&rsquo;ve been writing in the dark.
          <br />
          <span className="text-mint">We brought the stars.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-paper/80">
          A subscription diary where every entry gets a thoughtful, personal
          response — written in the voice of someone who knows both your story
          and your chart.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/reading"
            className="rounded-full bg-mint px-7 py-3 text-sm font-semibold text-ink transition hover:bg-mint-bright"
          >
            Begin your first entry
          </Link>
          <Link
            href="/#how"
            className="rounded-full border border-paper/30 px-7 py-3 text-sm font-medium text-paper transition hover:border-paper/70"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-6 text-sm text-paper/50">
          Free to start · Your rising sign is your story. This is where you write
          it.
        </p>
      </div>
    </section>
  );
}
