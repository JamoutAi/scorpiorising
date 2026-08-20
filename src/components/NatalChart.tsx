"use client";

import type { ChartSummary } from "@/lib/astrology";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};
const PLANET_GLYPH: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", rising: "ASC", ascendant: "ASC",
};

// Convert an ecliptic degree (0-360) to an (x,y) on a circle of given radius.
// 0° Aries is at the left (9 o'clock) in Western astrology convention.
function pointOnCircle(cx: number, cy: number, r: number, degree: number) {
  const rad = ((degree - 90) * Math.PI) / 180; // -90 so 0° is at top
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function NatalChart({ chart, size = 320 }: { chart: ChartSummary; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const signR = outerR - 22;
  const planetR = outerR - 52;

  // Build planet list from placements (skip duplicates of rising/ascendant shown as ASC)
  const planets = chart.placements.map((p) => ({
    key: p.key,
    glyph: PLANET_GLYPH[p.key] || p.label.slice(0, 3).toUpperCase(),
    degree: p.absDegree,
    color: p.key === "sun" ? "#c5a46b" : p.key === "moon" ? "#9bb3aa" : "#1fc896",
    retrograde: p.retrograde,
  }));

  // Ascendant point (rising sign start) — plot ASC marker
  const ascSignIndex = SIGNS.indexOf(chart.rising);
  const ascDegree = ascSignIndex >= 0 ? ascSignIndex * 30 : 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ maxWidth: "100%" }}>
      {/* Outer wheel */}
      <circle cx={cx} cy={cy} r={outerR} fill="#0c2a23" stroke="#1fc896" strokeWidth={1.5} opacity={0.95} />
      <circle cx={cx} cy={cy} r={signR} fill="none" stroke="rgba(244,241,234,0.18)" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="rgba(244,241,234,0.10)" strokeWidth={1} />

      {/* 12 sign divisions + glyphs */}
      {SIGNS.map((sign, i) => {
        const startDeg = i * 30;
        const midDeg = startDeg + 15;
        const p1 = pointOnCircle(cx, cy, outerR, startDeg);
        const p2 = pointOnCircle(cx, cy, signR, startDeg);
        const glyphPos = pointOnCircle(cx, cy, (outerR + signR) / 2, midDeg);
        return (
          <g key={sign}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(244,241,234,0.12)" strokeWidth={1} />
            <text
              x={glyphPos.x}
              y={glyphPos.y}
              fill="#c5a46b"
              fontSize={size * 0.05}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {SIGN_GLYPH[sign]}
            </text>
          </g>
        );
      })}

      {/* Ascendant marker */}
      <g>
        {(() => {
          const a = pointOnCircle(cx, cy, outerR, ascDegree);
          const b = pointOnCircle(cx, cy, planetR + 8, ascDegree);
          return (
            <>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1fc896" strokeWidth={2} />
              <text
                x={b.x}
                y={b.y}
                fill="#1fc896"
                fontSize={size * 0.045}
                textAnchor="middle"
                dominantBaseline="central"
              >
                ASC
              </text>
            </>
          );
        })()}
      </g>

      {/* Planets plotted by degree */}
      {planets.map((pl) => {
        const pos = pointOnCircle(cx, cy, planetR, pl.degree);
        return (
          <g key={pl.key}>
            <circle cx={pos.x} cy={pos.y} r={size * 0.032} fill="#0c2a23" stroke={pl.color} strokeWidth={1.5} />
            <text
              x={pos.x}
              y={pos.y}
              fill={pl.color}
              fontSize={size * 0.04}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {pl.glyph}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy - 8} fill="#f4f1ea" fontSize={size * 0.05} textAnchor="middle" fontFamily="var(--font-display), serif">
        {chart.sun}
      </text>
      <text x={cx} y={cy + 14} fill="#9bb3aa" fontSize={size * 0.035} textAnchor="middle">
        ☽ {chart.moon} · ASC {chart.rising}
      </text>
    </svg>
  );
}
