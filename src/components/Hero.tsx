import Link from "next/link";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="starfield absolute inset-0 opacity-60" />
      <div className="grid-pattern absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:py-32">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-mint">
            AI Journaling · Astrological Intelligence
          </p>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight md:text-6xl">
            You&rsquo;ve been writing{" "}
            <span className="italic text-mint">in the dark.</span>
            <br />
            We brought the stars.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/75">
            A subscription diary where every entry gets a thoughtful, personal
            response — written in the voice of someone who knows both your story
            and your chart.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/#pricing"
              className="rounded-full bg-mint px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright"
            >
              Start your free trial
            </Link>
            <Link
              href="/#how"
              className="rounded-full border border-paper/30 px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-paper transition hover:border-paper/70"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-paper/50">
            <span aria-hidden="true">🌙</span>
            <span aria-hidden="true" className="text-mint">✦</span>
            <span aria-hidden="true" className="text-mint">✧</span>
            <span aria-hidden="true">🪐</span>
            <span>7-day free trial · No credit card noise, just the stars.</span>
          </p>
        </div>
        <div className="relative">
          <HeroVisual className="mx-auto w-full max-w-md drop-shadow-[0_0_40px_rgba(185,245,224,0.25)] md:max-w-none" />
        </div>
      </div>
    </section>
  );
}
