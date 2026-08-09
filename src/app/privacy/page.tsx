import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl font-bold text-ink">Privacy</h1>
          <p className="mt-3 text-sm text-ink/50">Last updated: August 2026</p>

          <div className="mt-10 space-y-6 text-ink/80">
            <p>
              Scorpio Rising is a journal. That means the words you write here are
              among the most vulnerable you will ever put down. Privacy is not
              fine print for us — it is a feature and a promise.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-ink">
              What we collect
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Your birth date, time, and place — used only to calculate your natal chart.</li>
              <li>Your journal entries and the reflections we generate for you.</li>
              <li>Your email, if you join the waitlist or create an account.</li>
            </ul>

            <h2 className="font-serif text-2xl font-semibold text-ink">
              How we protect it
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Journal entries are encrypted at rest.</li>
              <li>
                Row-level security ensures a user can only ever read and write
                their own data. Our systems are scoped so no operator can read
                your entries.
              </li>
              <li>
                Your chart and entries are never sold, and never used to train
                models that serve other people.
              </li>
            </ul>

            <h2 className="font-serif text-2xl font-semibold text-ink">
              Not a substitute for care
            </h2>
            <p>
              Scorpio Rising offers reflection and emotional support. It is not a
              medical or mental-health service, and it does not diagnose or treat
              any condition. If you are in crisis, please reach out: the{" "}
              <a
                href="https://988lifeline.org"
                className="text-ink-soft underline"
              >
                988 Suicide &amp; Crisis Lifeline
              </a>{" "}
              is available 24/7 in the US (call or text 988), and you can text
              HOME to 741741 for the Crisis Text Line.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-ink">
              Your controls
            </h2>
            <p>
              You can export or delete your data at any time from your account
              settings. Deletion is permanent and removes your entries from our
              systems.
            </p>

            <p className="text-sm text-ink/50">
              Questions about your data? Email{" "}
              <a href="mailto:privacy@scorpiorising.ai" className="text-ink-soft underline">
                privacy@scorpiorising.ai
              </a>
              .
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
