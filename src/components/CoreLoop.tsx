const steps = [
  {
    title: "Share your chart",
    body: "Tell us your birth date, time, and place. We read your natal chart — sun, moon, and the rising sign you meet the world with.",
  },
  {
    title: "Write freely",
    body: "Open the page and say what you can't say out loud. No prompts required. No wrong way to begin.",
  },
  {
    title: "Receive your reflection",
    body: "Your diary responds in a voice shaped by your chart and where the sky is moving now — made for you, never generic.",
  },
];

export function CoreLoop() {
  return (
    <section id="how" className="bg-ink-deep py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-mint">
          The Core Loop
        </p>
        <h2 className="mt-4 text-center font-serif text-4xl font-bold text-paper">
          Write. Be seen. Rise.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint/15 font-semibold text-mint">
                {i + 1}
              </div>
              <h3 className="mt-5 font-serif text-xl font-semibold text-paper">
                {s.title}
              </h3>
              <p className="mt-3 text-paper/70">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
