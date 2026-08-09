export function Story() {
  return (
    <section id="story" className="relative bg-ink py-24 text-paper">
      <div className="starfield absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-mint">
          Our Story
        </p>
        <h2 className="mt-4 font-serif text-4xl font-bold md:text-5xl">
          I built the thing that got me through my divorce.
        </h2>
        <div className="mt-8 space-y-5 text-left text-lg text-paper/80">
          <p>
            I&rsquo;m Claire Redsun. I&rsquo;m a Scorpio Rising — which means I
            was built for transformation, even when it doesn&rsquo;t feel that
            way. During my divorce, I needed something that could hold the
            weight of what I was going through without flinching.
          </p>
          <p>
            I journaled. I checked my chart. I looked for something that could
            connect the two — that could reflect me back to myself with both
            warmth and intelligence. That thing didn&rsquo;t exist. So I built
            it.
          </p>
          <p>
            Scorpio Rising isn&rsquo;t named after your sign. It&rsquo;s named
            after mine. But the app meets you in yours.
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <span className="text-2xl">♏</span>
          <span className="font-medium">Claire Redsun</span>
          <span className="text-paper/50">· FOUNDER · SCORPIO RISING</span>
        </div>
      </div>
    </section>
  );
}
