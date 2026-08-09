import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scorpiorising.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/reading", "/story", "/privacy", "/terms", "/support"];
  const now = new Date();
  return routes.map((r) => ({
    url: `${siteUrl}${r}`,
    lastModified: now,
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
