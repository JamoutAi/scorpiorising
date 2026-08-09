import Link from "next/link";

export function WaitlistCTA() {
  return (
    <section className="bg-ink-deep py-24">
      <div className="mx-auto max-w-xl px-5 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-mint">
          Begin
        </p>
        <h2 className="mt-4 font-serif text-3xl font-bold text-paper">
          Your rising sign is your story. This is where you write it.
        </h2>
        <p className="mt-4 text-paper/70">
          Start a 7-day free trial — no risk, cancel anytime. Your diary knows
          your chart from the very first entry.
        </p>
        <Link
          href="/#pricing"
          className="mt-8 inline-block rounded-full bg-mint px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright"
        >
          Start your free trial
        </Link>
        <p className="mt-4 text-xs text-paper/50">
          Already a member?{" "}
          <Link href="/login" className="text-mint underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
