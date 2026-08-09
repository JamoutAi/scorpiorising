const features = [
  {
    title: "Chart-aware voice",
    body: "Your natal chart and current transits shape the AI's tone, framing, and the prompts it offers. Not generic — made for you.",
  },
  {
    title: "Memory with intention",
    body: "It remembers the divorce, the goal you set in March, the name you'd rather not type again — and threads them through future reflections.",
  },
  {
    title: "Transit-timed check-ins",
    body: "Prompts align with your transits. \"This week's tension isn't just you — here's what's moving.\" That's the daily-return hook.",
  },
  {
    title: "Witness, not advice",
    body: "It reflects and holds space more than it instructs. The warmth of a wise friend who knows your chart — never a diagnosis.",
  },
];

export function MagicFeatures() {
  return (
    <section id="features" className="bg-ink py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-mint">
          What makes it magic
        </p>
        <h2 className="mt-4 text-center font-serif text-4xl font-bold text-paper">
          A diary that knows your chart.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h3 className="font-serif text-2xl font-semibold text-paper">
                {f.title}
              </h3>
              <p className="mt-3 text-paper/70">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
