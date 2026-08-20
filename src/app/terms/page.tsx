import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl font-bold text-paper">Terms of Service</h1>
          <p className="mt-3 text-sm text-paper/50">Last updated: August 2026</p>

          <div className="mt-10 space-y-6 text-paper/80">
            <p>
              Welcome to Scorpio Rising. By using the app or website, you agree
              to these terms. If you do not agree, please don&rsquo;t use the
              service.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              What Scorpio Rising is
            </h2>
            <p>
              Scorpio Rising is a journaling companion that uses astrology and AI
              to reflect your writing back to you. It is a tool for reflection
              and self-understanding. It is not a healthcare provider, therapist,
              or emergency service.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              No clinical claims
            </h2>
            <p>
              We do not diagnose, treat, or cure any medical or mental-health
              condition. Nothing in Scorpio Rising should be taken as medical or
              psychological advice. If you are in crisis, contact emergency
              services or a crisis line (988 in the US, or text HOME to 741741).
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Accounts &amp; subscriptions
            </h2>
            <p>
              You are responsible for the accuracy of the birth information you
              provide. Paid plans renew automatically until cancelled. We will
              notify you before any price change affecting your plan.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Free trial &amp; billing
            </h2>
            <p>
              New members start with a 7-day free trial. You will not be charged
              during the trial period. At the end of the trial your selected plan
              renews automatically — currently $16.99/month or $79.99/year —
              until you cancel. You can cancel anytime from your account
              settings (Settings → Manage billing), and you will keep access
              until the end of the current billing period. Cancelling during the
              trial stops any charge before it happens.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Your content
            </h2>
            <p>
              You retain ownership of your journal entries. By using the service,
              you grant us a limited license to process your entries solely to
              provide reflections to you. We do not use your entries to train
              models for others.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-paper">
              Changes
            </h2>
            <p>
              We may update these terms. Material changes will be communicated in
              the app or by email. Continued use after changes means you accept
              the updated terms.
            </p>

            <p className="text-sm text-paper/50">
              Questions? Email{" "}
              <a href="mailto:support@scorpiorising.ai" className="text-mint underline">
                support@scorpiorising.ai
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
