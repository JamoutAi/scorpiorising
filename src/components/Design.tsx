"use client";

import { useEffect, useRef } from "react";

/* Ink-wash SVG divider — organic, fingerprint-ridge-like */
export function InkDivider({
  flip = false,
  fromColor = "#1b1133",
  toColor = "#15102b",
}: {
  flip?: boolean;
  fromColor?: string;
  toColor?: string;
}) {
  return (
    <div style={{ background: toColor, marginTop: "-1px" }}>
      <svg
        viewBox="0 0 1440 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          display: "block",
          width: "100%",
          height: "60px",
          transform: flip ? "scaleY(-1)" : "none",
        }}
      >
        <path
          d="M0,0 C180,52 360,8 540,38 C720,65 900,12 1080,42 C1260,68 1380,18 1440,30 L1440,0 Z"
          fill={fromColor}
        />
      </svg>
    </div>
  );
}

/* Constellation thread SVG — thin lines connecting star nodes */
export function ConstellationThread({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity: 0.35 }}
    >
      <line x1="20" y1="60" x2="60" y2="30" stroke="#2ed79f" strokeWidth="0.5" />
      <line x1="60" y1="30" x2="110" y2="50" stroke="#2ed79f" strokeWidth="0.5" />
      <line x1="110" y1="50" x2="150" y2="20" stroke="#2ed79f" strokeWidth="0.5" />
      <line x1="150" y1="20" x2="185" y2="40" stroke="#2ed79f" strokeWidth="0.5" />
      <circle cx="20" cy="60" r="2.5" fill="#2ed79f" />
      <circle cx="60" cy="30" r="2" fill="#2ed79f" />
      <circle cx="110" cy="50" r="3" fill="#2ed79f" />
      <circle cx="150" cy="20" r="2" fill="#2ed79f" />
      <circle cx="185" cy="40" r="2.5" fill="#2ed79f" />
    </svg>
  );
}

/* Scatter stars background */
export function StarField({ count = 40 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 137.5) % 100,
    y: (i * 97.3) % 100,
    size: (i % 3) + 1,
    delay: (i * 0.7) % 4,
    duration: 2 + (i % 4),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: "#ede8e0",
            opacity: 0.25 + (s.id % 3) * 0.15,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Scroll reveal wrapper */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* Marquee row */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <section
      style={{
        background: "#211435",
        borderTop: "1px solid rgba(255, 255, 255, 0.070)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.070)",
        padding: "1.1rem 0",
        overflow: "hidden",
      }}
    >
      <div className="marquee-track flex gap-12 items-center">
        {row.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.68rem",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#776b84",
              whiteSpace: "nowrap",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
