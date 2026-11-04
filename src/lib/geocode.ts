export interface GeoResult {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

async function lookup(q: string): Promise<GeoResult | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q,
    )}&count=1&language=en&format=json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.results?.[0];
    if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") {
      return null;
    }
    return { name: r.name, country: r.country, latitude: r.latitude, longitude: r.longitude };
  } catch {
    return null;
  }
}

/**
 * Geocode a city/place name to lat/long using the free Open-Meteo geocoding
 * API (no API key required). Open-Meteo matches on the place NAME only, so
 * "Denver colorado" or "Austin, Texas" finds nothing as typed. Try the full
 * text first, then the part before any comma, then drop trailing words one at
 * a time ("Denver colorado" → "Denver"; "New York city" → "New York").
 * Returns null if nothing is found.
 */
export async function geocodeCity(query: string): Promise<GeoResult | null> {
  const q = query.trim().replace(/\s+/g, " ");
  if (!q) return null;
  const tried = new Set<string>();
  const candidates: string[] = [q];
  const beforeComma = q.split(",")[0].trim();
  if (beforeComma) candidates.push(beforeComma);
  const words = beforeComma.split(" ");
  for (let n = words.length - 1; n >= 1; n--) candidates.push(words.slice(0, n).join(" "));
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (!c || tried.has(key)) continue;
    tried.add(key);
    const hit = await lookup(c);
    if (hit) return hit;
  }
  return null;
}
