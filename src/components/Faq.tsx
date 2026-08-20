import { Reveal } from "./Design";

const FAQS = [
  {
    q: "What is Scorpio Rising?",
    a: "Scorpio Rising is a journaling app that blends your birth chart with AI reflection. You write freely — about your day, your feelings, whatever's on your mind — and it responds with a personal reflection shaped by your natal chart, your current transits, and everything you've shared before. It's a private space to think out loud and be met with warmth and intelligence.",
  },
  {
    q: "How does my birth chart work in the app?",
    a: "When you set up your chart, you enter your birth date, time, and place. Scorpio Rising calculates your Sun, Moon, and Rising signs plus the rest of your placements, and uses them to personalize every reflection — the tone, the framing, even the prompts you're offered. Don't know your birth time? You can still use the app; your Rising sign will be approximate and we'll note it.",
  },
  {
    q: "Is Scorpio Rising a therapy or mental health service?",
    a: "No. Scorpio Rising is reflection and support, not a crisis or clinical service, and it does not provide therapy, diagnosis, or treatment. It's a journaling companion that helps you notice patterns and meaning. If you're in crisis, please use our Support page for emergency resources such as 988 (US) and the Crisis Text Line.",
  },
  {
    q: "What is a transit-timed check-in?",
    a: "Transits are the current positions of the planets. Scorpio Rising checks what's moving in the sky right now — retrogrades, squares, conjunctions, the Moon's sign — and ties your reflections and prompts to that energy. The idea is that the hard weeks aren't 'just you'; there's often something real moving above, and naming it can help.",
  },
  {
    q: "Does Scorpio Rising remember my past entries?",
    a: "Yes. It builds a long-term memory of your story — the goal you set, the person you'd rather not type again, the hard conversation you had — and threads those threads through future reflections. Over weeks and months it starts recognizing recurring themes across your emotions, relationships, and decisions.",
  },
  {
    q: "How much does Scorpio Rising cost?",
    a: "There's a 7-day free trial. After that it's $16.99/month or $79.99/year (about $6.67/month billed annually). You can cancel anytime, and you won't be charged during the trial if you cancel first.",
  },
  {
    q: "Is my journal private?",
    a: "Privacy is a feature, not fine print. Your entries are tied to your account and are not used to train shared models in a way that exposes them. The app is built to be a private, encrypted-by-design space — you can read our Privacy page for the details.",
  },
  {
    q: "Do I need to believe in astrology to use it?",
    a: "Not at all. Scorpio Rising is built for believers and the curious alike. Your chart is the lens; the reflection is yours either way. Many people use it simply as a thoughtful, consistent journaling practice.",
  },
  {
    q: "Can I use Scorpio Rising on my phone?",
    a: "Yes. The app is responsive and works in your mobile browser, with a sidebar on desktop and a streamlined view on smaller screens so you can write and reflect wherever you are.",
  },
  {
    q: "What can I ask the Ask Scorpio Rising chatbot?",
    a: "Ask is scoped to astrology — your chart, horoscopes, transits, the planets, and the zodiac. It won't answer unrelated general-knowledge questions; it stays within astrology, your chart, and your journal so the conversation stays meaningful and on-topic.",
  },
];

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  return (
    <Reveal delay={i * 50}>
      <details className="faq-item group border-b" style={{ borderColor: "rgba(23,37,31,0.10)" }}>
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-4 py-5"
          style={{ fontFamily: "var(--font-display), serif", fontSize: "1.25rem", fontWeight: 400, color: "#17251f" }}
        >
          <span>{q}</span>
          <span
            className="shrink-0 text-2xl leading-none transition-transform duration-200 group-open:rotate-45"
            style={{ color: "#1aa37c", fontFamily: "var(--font-sans), sans-serif" }}
            aria-hidden
          >
            +
          </span>
        </summary>
        <p
          className="pb-6 pr-8"
          style={{ fontFamily: "var(--font-display), serif", fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.7, color: "#3a4a43" }}
        >
          {a}
        </p>
      </details>
    </Reveal>
  );
}

export function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "#f7f3ea", color: "#17251f" }}>
      <div className="container-x relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="reveal mb-5 flex items-center justify-center gap-3">
            <span className="bar" style={{ background: "#1fc896", height: "1px", width: "2rem" }} />
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#1aa37c",
              }}
            >
              Questions
            </span>
            <span className="bar" style={{ background: "#1fc896", height: "1px", width: "2rem" }} />
          </div>
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.12,
              color: "#17251f",
            }}
          >
            The things people{" "}
            <em style={{ fontStyle: "italic", color: "#1aa37c" }}>ask first.</em>
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
