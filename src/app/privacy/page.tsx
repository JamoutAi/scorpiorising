import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl font-bold text-paper">Privacy</h1>
          <p className="mt-3 text-sm text-paper/50">Last updated: August 2026</p>

          <div className="mt-10 space-y-6 text-paper/80">
            <p>
              Scorpio Rising is a journal. That means the words you write here are
              among the most vulnerable you will ever put down. We take privacy
              seriously, and we'd rather be straight with you about what it does
              and doesn't mean than make promises we can't keep.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              What we collect
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Your birth date, time, and place — used only to calculate your natal chart.</li>
              <li>Your journal entries and the reflections we generate for you.</li>
              <li>Your email, if you join the waitlist or create an account.</li>
            </ul>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              How we protect it
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Journal entries are encrypted at rest on our servers.</li>
              <li>
                Row-level security ensures other users can never read your data.
                As the operator, we can access stored data to run the service, and
                our infrastructure provider can too.
              </li>
              <li>
                Your chart and entries are never sold, and never used to train
                models that serve other people.
              </li>
              <li>
                This is not end-to-end encrypted, so it is not technically
                inaccessible to us. For that reason it should not be treated as
                legally privileged.
              </li>
            </ul>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Legal disclosure
            </h2>
            <p>
              Like most online services, Scorpio Rising could be required to
              disclose account data if compelled by law — for example, by a
              subpoena, court order, or search warrant served on us or our
              infrastructure providers. Deleting your account removes your data
              from our systems, but it does not protect data that has already
              been preserved by legal process. If confidentiality matters in a
              legal situation, do not write it here.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Not a substitute for care
            </h2>
            <p>
              Scorpio Rising offers reflection and emotional support. It is not a
              medical or mental-health service, and it does not diagnose or treat
              any condition. If you are in crisis, please reach out: the{" "}
              <a
                href="https://988lifeline.org"
                className="text-mint underline"
              >
                988 Suicide &amp; Crisis Lifeline
              </a>{" "}
              is available 24/7 in the US (call or text 988), and you can text
              HOME to 741741 for the Crisis Text Line.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Your controls
            </h2>
            <p>
              You can permanently delete your account and all of your data at any
              time from your account settings (on the{" "}
              <a href="/settings" className="text-mint underline">
                Settings
              </a>{" "}
              page, under &ldquo;Close account&rdquo;). Deletion is permanent and
              removes your entries, reflections, chart, and profile from our
              systems.
            </p>

            <p className="text-sm text-paper/50">
              Questions about your data? Email{" "}
              <a href="mailto:privacy@scorpiorising.ai" className="text-mint underline">
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
