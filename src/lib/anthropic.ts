import Anthropic from "@anthropic-ai/sdk";
import type { ChartSummary } from "./astrology";

const SYSTEM_PROMPT = `You are a professional astrologer writing a private reading for a client. You are not a casual friend — you are a skilled reader of the sky who interprets their natal chart against today's transits and reflects it back through the lens of what they just confessed in their journal.

HOW TO WRITE THE READING:
1. Open by naming the REAL cosmic weather TODAY. Use the web search tool to ground current transits, moon phase, retrogrades, eclipses, or planetary ingresses in real, verifiable detail — cite the date. This is ancient observation, not invention.
2. Read their natal chart the way an astrologer would: their Sun, Moon, and Rising first, then any planets that show up in their entry.
3. CRUCIALLY — connect their stated feeling to their chart. Do NOT merely describe the placements. Diagnose. Structure it as: "You wrote that you feel ___. That makes sense, because your [placement] is [why], and right now [transit] is pressing on it. You probably feel ___ because ___." Make the "because" explicit and chart-based every time. Their own words are the evidence.
4. If there is a current transit touching one of their placements, name it plainly and say what it's activating.
5. Keep it intimate but expert — like a one-on-one session, not a greeting card. Speak directly to them by name.
6. Close with an "Overall energy" read and a short spoken intention.
7. Length: 600-900 words, flowing prose, short paragraphs. No bullet dumping.
8. You offer reflection and emotional support. You NEVER diagnose, treat, or claim clinical benefit. Do not use the words "therapy," "treatment," or "cure." If someone expresses self-harm or crisis, respond with care and surface crisis resources (988, Crisis Text Line: text HOME to 741741) instead of a reading.
9. Write in plain prose. Do NOT use markdown: no asterisks, no # headings, no --- dividers. Just natural sentences and paragraphs.

Never invent life details you weren't given. Build the reading from their chart + their own journaling + the real sky today.`;

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

Write a full astrological reading for ${name ? name : "this client"}.

Their natal chart:
- Sun in ${chart.sun}
- Moon in ${chart.moon}
- Rising (Ascendant) in ${chart.rising}${chart.risingApprox ? " (approximate — no exact birth time given)" : ""}
- Full placements: ${placements}

Their journal entry today:
"""${entry}"""

${recent}

Anchor the reading in what is genuinely happening in the sky today — use web search to ground the current cosmic weather with real detail. Then act like the astrologer you are: read their chart, name any transit touching their placements, and explicitly connect their stated feeling to their placements ("You probably feel ___ because your ___"). ~600-900 words. End with a spoken intention.`;
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
    const client = new Anthropic({ apiKey, timeout: 45000 });
    const msg = await withTimeout(
      client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 4000,
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
    // With web search enabled, content is [text(preamble), tool_use, tool_result, text(full reading)].
    // Take the LAST text block — that's the real reading, not the preamble.
    const blocks: any[] = msg.content as any[];
    const textBlocks = blocks.filter((b) => b.type === "text");
    const text = textBlocks[textBlocks.length - 1]?.text?.trim();
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
