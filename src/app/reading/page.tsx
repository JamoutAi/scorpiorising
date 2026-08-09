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
        <section className="bg-ink py-20 text-paper">
          <div className="starfield absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-2xl px-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-mint">
              Your Free First Reading
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold md:text-5xl">
              Meet your diary.
            </h1>
            <p className="mt-4 text-paper/80">
              Tell us when and where you were born. We&rsquo;ll read your chart
              and write you a short, personal reflection — made for you, never
              generic.
            </p>
          </div>
        </section>

        <section className="bg-mist py-16">
          <div className="mx-auto max-w-2xl px-5">
            <form
              action="/api/reading"
              method="post"
              className="rounded-3xl border border-ink/10 bg-paper p-8 shadow-sm"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink">
                  Birth date
                  <input
                    type="date"
                    name="birthDate"
                    required
                    max={maxDate}
                    min={`${currentYear - 120}-01-01`}
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-ink-soft"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Birth time
                  <input
                    type="time"
                    name="birthTime"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-ink-soft"
                  />
                  <span className="mt-1 block text-xs font-normal text-ink/50">
                    Unknown? Leave blank — your Rising sign will be approximate.
                  </span>
                </label>
              </div>

              <label className="mt-5 block text-sm font-medium text-ink">
                Birth city / place
                <input
                  type="text"
                  name="birthPlace"
                  required
                  placeholder="e.g. Austin, Texas"
                  className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-ink-soft"
                />
              </label>

              <label className="mt-5 block text-sm font-medium text-ink">
                Name (optional)
                <input
                  type="text"
                  name="name"
                  placeholder="What should we call you?"
                  className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-ink-soft"
                />
              </label>

              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-ink px-7 py-3 text-sm font-semibold text-paper transition hover:bg-ink-soft"
              >
                Receive my reading
              </button>
              <p className="mt-4 text-center text-xs text-ink/50">
                Reflection and support, not therapy. By continuing you agree to
                our{" "}
                <Link href="/terms" className="text-ink-soft underline">
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
