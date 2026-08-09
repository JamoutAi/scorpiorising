import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl font-bold text-ink">Support</h1>

          <div className="mt-10 space-y-6 text-ink/80">
            <p>
              We&rsquo;re a small, founder-led team and we read every message.
              Reach us at{" "}
              <a href="mailto:support@scorpiorising.ai" className="text-ink-soft underline">
                support@scorpiorising.ai
              </a>
              .
            </p>

            <h2 className="font-serif text-2xl font-semibold text-ink">
              In crisis?
            </h2>
            <p>
              Scorpio Rising is reflection and support, not a crisis service. If
              you are thinking about harming yourself, please contact:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>988 Suicide &amp; Crisis Lifeline</strong> (US) — call or
                text <strong>988</strong>, or visit{" "}
                <a href="https://988lifeline.org" className="text-ink-soft underline">
                  988lifeline.org
                </a>
                .
              </li>
              <li>
                <strong>Crisis Text Line</strong> — text <strong>HOME</strong> to{" "}
                <strong>741741</strong>.
              </li>
              <li>Outside the US, contact your local emergency number.</li>
            </ul>

            <h2 className="font-serif text-2xl font-semibold text-ink">
              Common questions
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Do I need to believe in astrology?</strong> The app is
                built for believers and the curious. Your chart is the lens; the
                reflection is yours either way.
              </li>
              <li>
                <strong>Is my journal private?</strong> Yes — entries are
                encrypted at rest and isolated to your account. See our{" "}
                <a href="/privacy" className="text-ink-soft underline">
                  Privacy
                </a>{" "}
                page.
              </li>
              <li>
                <strong>What if I don&rsquo;t know my birth time?</strong> You
                can still get a reading; your Rising sign will be approximate and
                we&rsquo;ll note it.
              </li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
