import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Your Free First Reading",
  description:
    "Get a free, chart-aware reflection from Scorpio Rising. Enter your birth details and meet your diary.",
};

export default function ReadingPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const maxDate = now.toISOString().split("T")[0];

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative bg-ink py-20 text-paper">
          <div className="starfield absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-2xl px-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-mint">
              Your Free First Reading
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold text-paper md:text-5xl">
              Meet your diary.
            </h1>
            <p className="mt-4 text-paper/80">
              Tell us when and where you were born. We&rsquo;ll read your chart
              and write you a short, personal reflection — made for you, never
              generic.
            </p>
          </div>
        </section>

        <section className="bg-ink-deep py-16">
          <div className="mx-auto max-w-2xl px-5">
            <form
              action="/api/reading"
              method="post"
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-paper">
                  Birth date
                  <input
                    type="date"
                    name="birthDate"
                    required
                    max={maxDate}
                    min={`${currentYear - 120}-01-01`}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none focus:border-mint/50"
                  />
                </label>
                <label className="text-sm font-medium text-paper">
                  Birth time
                  <input
                    type="time"
                    name="birthTime"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none focus:border-mint/50"
                  />
                  <span className="mt-1 block font-normal text-paper/50">
                    Unknown? Leave blank — your Rising sign will be approximate.
                  </span>
                </label>
              </div>

              <label className="mt-5 block text-sm font-medium text-paper">
                Birth city / place
                <input
                  type="text"
                  name="birthPlace"
                  required
                  placeholder="e.g. Austin, Texas"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
                />
              </label>

              <label className="mt-5 block text-sm font-medium text-paper">
                Name (optional)
                <input
                  type="text"
                  name="name"
                  placeholder="What should we call you?"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
                />
              </label>

              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-mint px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:bg-mint-bright"
              >
                Receive my reading
              </button>
              <p className="mt-4 text-center text-xs text-paper/50">
                Reflection and support, not therapy. By continuing you agree to
                our{" "}
                <Link href="/terms" className="text-mint underline">
                  Terms
                </Link>
                .
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
