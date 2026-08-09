export function HeroVisual({ className = "" }: { className?: string }) {
  const rings = Array.from({ length: 17 }, (_, i) => 282 - i * 16);
  const stars = [
    { x: 70, y: 110, r: 3 },
    { x: 520, y: 130, r: 2.4 },
    { x: 110, y: 500, r: 2.8 },
    { x: 490, y: 480, r: 3.2 },
    { x: 40, y: 320, r: 2 },
    { x: 560, y: 340, r: 2.6 },
    { x: 300, y: 36, r: 2.2 },
    { x: 300, y: 566, r: 2.4 },
  ];
  const constellation = [
    [250, 250],
    [282, 232],
    [305, 262],
    [338, 244],
    [362, 272],
    [315, 305],
  ];

  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      role="img"
      aria-label="A glowing fingerprint woven through with constellations"
    >
      <defs>
        <filter id="warp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.013 0.02"
            numOctaves="2"
            seed="9"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="ridge" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#b9f5e0" />
          <stop offset="100%" stopColor="#8df0cf" />
        </radialGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(185,245,224,0.20)" />
          <stop offset="100%" stopColor="rgba(185,245,224,0)" />
        </radialGradient>
      </defs>

      <circle cx="300" cy="300" r="300" fill="url(#halo)" />

      <g filter="url(#glow)">
        <g
          filter="url(#warp)"
          fill="none"
          stroke="url(#ridge)"
          strokeWidth="2.1"
          opacity="0.92"
          transform="rotate(-10 300 300)"
        >
          {rings.map((r, i) => (
            <circle key={i} cx="300" cy="300" r={r} />
          ))}
        </g>
      </g>

      <circle
        cx="300"
        cy="300"
        r="10"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        opacity="0.85"
        filter="url(#glow)"
      />

      <g stroke="#ffffff" strokeWidth="1" opacity="0.55">
        {constellation.slice(1).map((p, i) => (
          <line
            key={i}
            x1={constellation[i][0]}
            y1={constellation[i][1]}
            x2={p[0]}
            y2={p[1]}
          />
        ))}
      </g>
      <g fill="#ffffff">
        {constellation.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={i % 2 === 0 ? 2.6 : 1.8}
          />
        ))}
      </g>

      <g fill="#b9f5e0" filter="url(#glow)">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} />
        ))}
      </g>
    </svg>
  );
}
