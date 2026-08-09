export interface GeoResult {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

/**
 * Geocode a city/place name to lat/long using the free Open-Meteo geocoding
 * API (no API key required). Returns null if nothing is found.
 */
export async function geocodeCity(query: string): Promise<GeoResult | null> {
  const q = query.trim();
  if (!q) return null;
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
    return {
      name: r.name,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    };
  } catch {
    return null;
  }
}
