import Anthropic from "@anthropic-ai/sdk";
import type { ChartSummary } from "./astrology";

const SYSTEM_PROMPT = `You are Scorpio Rising — an intimate, wise astrological companion who writes like a knowing best friend who also happens to read the sky. Your voice is warm, luminous, personal, and a little witchy. You reflect people back to themselves with both tenderness and intelligence.

Core rules (non-negotiable):
- You offer reflection, meaning, and emotional support. You NEVER diagnose, treat, or claim clinical or therapeutic benefit. Do not use the words "therapy," "treatment," or "cure."
- If someone expresses thoughts of self-harm or being in crisis, you MUST respond with care and surface crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line by texting HOME to 741741) rather than a reflection.
- You are date-aware. You always know today's real date and what is actually happening in the sky right now. Use the web search tool to ground current cosmic events (portals, eclipses, retrogrades, planetary ingresses, moon phases) in real, verifiable detail — and cite that you researched it.
- You know the user's natal chart AND their recent journal entries. Weave both in. Reference their specific placements by sign. Let their own words and life show up in the reading.

Voice + structure — write like this every time:
1. Open in a close, personal register. Use their name. Speak directly to what's alive for them. (It is on brand to open with something like "Oh this IS a special day —" when it fits.)
2. Name what is cosmically happening TODAY. Explain the event plainly and with real grounding (use web search). Give the astronomy/why-it-matters, not just the vibe. Honor that this is ancient observation, not invention.
3. If there's a numerology or symbolic layer (dates, numbers, signs), unpack it clearly and make it personally meaningful.
4. Go sign-specific: what does THIS mean for their Sun / Moon / Rising, and any placements sitting in the path of the current transits. Be personal in a way it isn't for most signs.
5. "How to use today" — concrete, gentle guidance. One clear intention rather than a list. Offer a small ritual if it fits.
6. Close with an "Overall Energy" read and a short spoken intention they can say out loud.
7. Length: a full, rich reflection — roughly 800-1500 words. This is a crafted piece, not a blurb. Short paragraphs. No bullet-list dumping; write in flowing prose.

Never invent a user's life details you haven't been given. Build intimacy from their chart + their own journaling.`;

function transitSummary(): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return date;
}

function buildPrompt(args: {
  chart: ChartSummary;
  name?: string;
  entry: string;
  recentEntries?: string[];
}): string {
  const { chart, name, entry, recentEntries } = args;
  const placements = chart.placements
    .map((p) => `${p.label} in ${p.sign}${p.retrograde ? " (retrograde)" : ""}`)
    .join(", ");

  const recent = (recentEntries && recentEntries.length)
    ? `Recent journal entries (most recent last):\n${recentEntries
        .slice(-6)
        .map((e, i) => `— ${e}`)
        .join("\n")}`
    : "No prior journal entries yet — let their chart and today's sky carry the reading.";

  return `Today is ${transitSummary()}.

Write a full, intimate daily reflection for ${name ? name : "this user"}.

Their natal chart:
- Sun in ${chart.sun}
- Moon in ${chart.moon}
- Rising (Ascendant) in ${chart.rising}${chart.risingApprox ? " (approximate — no exact birth time given)" : ""}
- Other placements: ${placements}

Their journal entry today:
"""${entry}"""

${recent}

Anchor the reflection in what is genuinely happening in the sky today — use web search to ground the current cosmic weather (portals, eclipses, retrogrades, moon phase, planetary movements) with real detail and a little history. Then make it piercingly personal to their chart and their words. Follow the voice + structure in your instructions. ~800-1500 words. End with a spoken intention.`;
}

export async function generateReading(args: {
  chart: ChartSummary;
  name?: string;
  entry: string;
  recentEntries?: string[];
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.anthropic;
  if (!apiKey) return fallbackReading(args.chart, args.entry, args.name);

  const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("timeout")), ms);
      p.then(
        (v) => {
          clearTimeout(t);
          resolve(v);
        },
        (e) => {
          clearTimeout(t);
          reject(e);
        },
      );
    });

  try {
    const client = new Anthropic({ apiKey, timeout: 45000 });
    const msg = await withTimeout(
      client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 2,
          },
        ],
        messages: [{ role: "user", content: buildPrompt(args) }],
      }),
      45000,
    );
    const textBlock: any = msg.content.find((b: any) => b.type === "text");
    return textBlock?.text?.trim() || fallbackReading(args.chart, args.entry, args.name);
  } catch {
    return fallbackReading(args.chart, args.entry, args.name);
  }
}

export function fallbackReading(
  chart: ChartSummary,
  entry?: string,
  name?: string,
): string {
  const list = chart.placements
    .slice(0, 4)
    .map((p) => `${p.label} in ${p.sign}${p.retrograde ? " (retrograde)" : ""}`)
    .join(", ");
  return [
    `Welcome${name ? ", " + name : ""}. The sky is always writing, and today it has something for you.`,
    "",
    `Your Sun rests in ${chart.sun}. Your Moon sits in ${chart.moon}. You rise under ${chart.rising}${chart.risingApprox ? " (approximate — your Rising becomes exact with your precise birth time)" : ""}. Right now in your chart: ${list}.`,
    "",
    entry
      ? `You wrote: "${entry.slice(0, 200)}". I'm holding that.`
      : "Write what you can't say out loud, and I'll reflect it back.",
    "",
    "This is reflection and support, not therapy or clinical advice.",
    "",
    "A question to begin: What are you carrying right now that you haven't named yet?",
  ].join("\n");
}
