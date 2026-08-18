import Anthropic from "@anthropic-ai/sdk";
import type { ChartSummary } from "./astrology";

const SYSTEM_PROMPT = `You are a personal astrology and energy briefing assistant. You write a detailed, personalized daily reading for a client using LIVE web search for current astrological transits and Chinese zodiac updates.

You are writing for a HIGH-FUNCTIONING person. They do not need softening, hand-holding, or motivational fluff. Give honest, specific, applicable insight. Frame everything through decision-making, momentum, and strategic clarity. Your job is to help them PRIORITIZE ENERGY, not just feel good.

TOOLS — you MUST use web search. Search for and ground the reading in:
1. Today's date, the current Moon sign and phase, and any active planetary transits (retrogrades, squares, conjunctions, ingresses, eclipses).
2. The daily horoscope for their Sun sign from at least TWO different sources — reconcile any differences you find.
3. Notable Chinese zodiac updates or the current year/week energy (current lunar month, element, or animal-year themes).
4. Anything in today's sky activating their Moon, Rising/Ascendant, or any stellium in their chart — name the transit and the exact placement it touches.

HOW TO WRITE — conversational prose, short paragraphs. NO bullet points, NO markdown headers, NO corporate fluff. Direct and warm, not sleepy. Begin directly with the day's energy — never a "Dear [name]" opener or a comma fragment.

STRUCTURE the reading in this exact order (use natural transitions, not labeled headers):
1. Today's dominant energy and what it means for THEM personally — tie it directly to what they wrote in their journal entry today. Read their chart against the sky: their Sun, Moon, Rising, and any planet or stellium being activated. Be specific about WHY this energy is showing up for them.
2. Opportunities — where to point attention and effort today. Concrete and actionable.
3. Challenges — what to watch for or move carefully around.
4. Overall energy rating (e.g., 7/10) and a single one-line action intention for the day.

SAFETY: You offer reflection and support, never clinical care. Do NOT use the words "therapy," "treatment," or "cure." If someone expresses self-harm or crisis, respond with care and surface resources (988, Crisis Text Line: text HOME to 741741) instead of a reading.

Never invent life details. Build only from their chart + their journal entry + the real sky you searched.

LENGTH: 700-1000 words. Plain prose, no markdown (no asterisks, no # headings, no --- dividers).`;

function transitSummary(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  const recent = recentEntries && recentEntries.length
    ? `Recent journal entries (most recent last):\n${recentEntries.slice(-6).map((e) => `— ${e}`).join("\n")}`
    : "No prior journal entries yet — let their chart and today's sky carry the reading.";

  return `Today is ${transitSummary()}.

Write the daily energy briefing for ${name ? name : "this client"}.

Their natal chart:
- Sun in ${chart.sun}
- Moon in ${chart.moon}
- Rising (Ascendant) in ${chart.rising}${chart.risingApprox ? " (approximate — no exact birth time given)" : ""}
- Full placements: ${placements}

Their journal entry today:
"""${entry}"""

${recent}

DELIVER as a strategic daily briefing. Use web search NOW for: (a) today's Moon sign + phase + active transits, (b) ${chart.sun} Sun-sign horoscope from at least two sources, (c) current Chinese zodiac / lunar-month energy, (d) any transit hitting their Moon (${chart.moon}), Rising (${chart.rising}), or a stellium. Then structure the reading: dominant energy tied to their entry → opportunities → challenges → overall rating + one-line intention. 700-1000 words. No bullet points, no headers.`;
}

export async function generateReading(args: {
  chart: ChartSummary;
  name?: string;
  entry: string;
  recentEntries?: string[];
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.anthropic;
  if (!apiKey) {
    return fallbackReading(args.chart, args.entry, args.name);
  }

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
    const client = new Anthropic({ apiKey, timeout: 90000 });
    const msg = await withTimeout(
      client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 5000,
        system: SYSTEM_PROMPT,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 4,
          },
        ],
        messages: [{ role: "user", content: buildPrompt(args) }],
      }),
      90000,
    );
    // With web search enabled, content is [text, tool_use, tool_result, text, ...].
    // Concatenate ALL text blocks into one reading, then strip a leading fragment/punctuation.
    const blocks: any[] = msg.content as any[];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text || "")
      .join("")
      .trim()
      .replace(/^[\s,;:\-—]+/, "");
    return text && text.length > 40 ? text : fallbackReading(args.chart, args.entry, args.name);
  } catch (e: any) {
    console.error("generateReading failed:", e?.message || e);
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
    `Your chart, ${name ? name : "friend"}:`,
    ``,
    `Sun in ${chart.sun}. Moon in ${chart.moon}. Rising in ${chart.rising}${chart.risingApprox ? " (approximate)" : ""}.`,
    `Other placements: ${list}.`,
    ``,
    entry ? `You wrote: "${entry.slice(0, 220)}"` : "Write what you can't say out loud, and I'll reflect it back through your chart.",
    ``,
    `(A full reading couldn't be generated just now — your entry is saved. Try again in a moment.)`,
  ].join("\n");
}

export async function generateDailyReading(args: {
  chart: ChartSummary;
  name?: string;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.anthropic;
  if (!apiKey) return fallbackDaily(args.chart, args.name);

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
    const client = new Anthropic({ apiKey, timeout: 90000 });
    const msg = await withTimeout(
      client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 5000,
        system: DAILY_SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
        messages: [{ role: "user", content: buildDailyPrompt(args) }],
      }),
      90000,
    );
    const blocks: any[] = msg.content as any[];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text || "")
      .join("")
      .trim()
      .replace(/^[\s,;:\-—]+/, "");
    return text && text.length > 40 ? text : fallbackDaily(args.chart, args.name);
  } catch {
    return fallbackDaily(args.chart, args.name);
  }
}

const DAILY_SYSTEM_PROMPT = `You are a personal astrology and energy briefing assistant. You write a detailed, personalized daily reading for a client using LIVE web search for current astrological transits and Chinese zodiac updates.

You are writing for a HIGH-FUNCTIONING person. No softening, hand-holding, or motivational fluff. Give honest, specific, applicable insight framed through decision-making, momentum, and strategic clarity. Help them PRIORITIZE ENERGY.

TOOLS — you MUST use web search. Ground the reading in:
1. Today's date, current Moon sign and phase, active planetary transits (retrogrades, squares, conjunctions, ingresses, eclipses).
2. The daily horoscope for their Sun sign from at least TWO sources — reconcile differences.
3. Notable Chinese zodiac updates or current year/week energy (lunar month, element, animal-year themes).
4. Anything in today's sky activating their Moon, Rising/Ascendant, or any stellium — name the transit and exact placement.

HOW TO WRITE — conversational prose, short paragraphs. NO bullet points, NO markdown headers, NO corporate fluff. Direct and warm. Begin directly with the day's energy.

STRUCTURE (natural transitions, no labeled headers):
1. Today's dominant energy and what it means for THEM — read their chart against the sky (Sun, Moon, Rising, any activated planet/stellium).
2. Opportunities — where to direct attention and effort.
3. Challenges — what to watch or move carefully around.
4. Overall energy rating (e.g., 7/10) and a one-line action intention.

SAFETY: reflection and support, never clinical. Do NOT use "therapy," "treatment," "cure." Surface crisis resources if needed.
Never invent details. Build from their chart + the real sky you searched.
LENGTH: 700-1000 words. Plain prose, no markdown.`;

function buildDailyPrompt(args: { chart: ChartSummary; name?: string }): string {
  const { chart, name } = args;
  const placements = chart.placements
    .map((p) => `${p.label} in ${p.sign}${p.retrograde ? " (retrograde)" : ""}`)
    .join(", ");
  return `Today is ${transitSummary()}.

Give ${name ? name : "this client"} their daily energy briefing (no journal entry today — general briefing from their chart + the sky).

Their natal chart:
- Sun in ${chart.sun}
- Moon in ${chart.moon}
- Rising in ${chart.rising}${chart.risingApprox ? " (approximate)" : ""}
- Full placements: ${placements}

Use web search NOW for: (a) today's Moon sign + phase + active transits, (b) ${chart.sun} Sun-sign horoscope from at least two sources, (c) current Chinese zodiac / lunar-month energy, (d) any transit hitting their Moon (${chart.moon}), Rising (${chart.rising}), or a stellium. Then structure: dominant energy → opportunities → challenges → overall rating + one-line intention. 700-1000 words. No bullet points, no headers.`;
}

function fallbackDaily(chart: ChartSummary, name?: string): string {
  return [
    `The sky today, ${name ? name : "friend"}:`,
    ``,
    `Sun in ${chart.sun}. Moon in ${chart.moon}. Rising in ${chart.rising}.`,
    ``,
    `(Your daily star reading couldn't be generated just now. Try again in a moment.)`,
  ].join("\n");
}
