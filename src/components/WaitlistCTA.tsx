import Link from "next/link";
import { Reveal, StarField, ConstellationThread } from "./Design";

export function WaitlistCTA() {
  return (
    <section
      className="relative overflow-hidden py-32 text-center"
      style={{
        background: "#0c2a23",
        backgroundImage: "url(/assets/hero-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundBlendMode: "overlay",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(18, 11, 38, 0.75), rgba(46, 215, 159, 0.88))" }}
      />
      <div className="absolute inset-0 ridge-texture" />
      <StarField count={45} />
      <div className="container-x relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo.png"
          alt="Scorpio Rising"
          className="reveal constellation-glow float mx-auto mb-8"
          style={{ width: "110px", height: "110px", objectFit: "contain" }}
        />
        <h2
          className="reveal"
          style={{
            fontFamily: "var(--font-display), serif",
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            fontWeight: 300,
            lineHeight: 1.1,
            color: "#f0ebe2",
          }}
        >
          Your rising sign is your story.{" "}
          <em style={{ fontStyle: "italic", color: "#2ed79f" }}>This is where you write it.</em>
        </h2>
        <p
          className="reveal"
          style={{
            fontFamily: "var(--font-display), serif",
            fontSize: "1.2rem",
            fontWeight: 300,
            color: "#7d7189",
            maxWidth: "480px",
            margin: "0 auto 2.5rem",
          }}
        >
          Begin your first entry on a 7-day free trial. Just the stars.
        </p>
        <div className="reveal flex flex-wrap justify-center gap-4">
          <Link href="/start-trial" className="btn-phosphor">
            Begin Your First Entry
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign In
          </Link>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="w-48 opacity-30">
            <ConstellationThread />
          </div>
        </div>
      </div>
    </section>
  );
}
