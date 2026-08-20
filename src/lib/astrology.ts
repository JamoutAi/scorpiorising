import { Origin, Horoscope } from "circular-natal-horoscope-js";

export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  latitude: number;
  longitude: number;
}

export interface PlanetPlacement {
  key: string;
  label: string;
  sign: string;
  degreeInSign: number;
  absDegree: number;
  retrograde: boolean;
}

export interface ChartSummary {
  sun: string;
  moon: string;
  rising: string;
  risingApprox: boolean;
  placements: PlanetPlacement[];
  generatedAt: string;
}

const PLANET_KEYS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
] as const;

/**
 * Compute a natal chart summary from birth data using a local ephemeris
 * (circular-natal-horoscope-js). No external astrology API required.
 */
export function calculateChart(
  birth: BirthInput,
  risingApprox = false,
): ChartSummary {
  const origin = new Origin({
    year: birth.year,
    month: birth.month - 1, // library expects 0-indexed months
    date: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    latitude: birth.latitude,
    longitude: birth.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies"],
    aspectWithPoints: ["bodies"],
    aspectTypes: ["major"],
    language: "en",
  });

  const bodies: Record<string, any> = horoscope.CelestialBodies || {};

  const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

  const placements: PlanetPlacement[] = PLANET_KEYS.map((key) => {
    const b = bodies[key] || {};
    const signObj = b.Sign || {};
    const ecl = b.ChartPosition?.Ecliptic?.DecimalDegrees;
    const signLabel = (signObj.label as string) || "unknown";
    const degreeInSign = typeof ecl === "number" ? +((ecl % 30) + 1).toFixed(1) : 0;
    const signIndex = SIGNS.indexOf(signLabel);
    const absDegree = signIndex >= 0 ? +(signIndex * 30 + (ecl - Math.floor(ecl / 30) * 30)).toFixed(2) : 0;
    return {
      key,
      label: (b.label as string) || key.charAt(0).toUpperCase() + key.slice(1),
      sign: signLabel,
      degreeInSign,
      absDegree,
      retrograde: !!b.retrograde,
    };
  });

  const sunSign =
    (horoscope.SunSign?.label as string) ||
    placements.find((p) => p.key === "sun")?.sign ||
    "unknown";
  const moonSign =
    placements.find((p) => p.key === "moon")?.sign || "unknown";
  const risingSign =
    (horoscope.Ascendant?.Sign?.label as string) || "unknown";

  return {
    sun: sunSign,
    moon: moonSign,
    rising: risingSign,
    risingApprox,
    placements,
    generatedAt: new Date().toISOString(),
  };
}
