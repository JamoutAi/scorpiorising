import Anthropic from "@anthropic-ai/sdk";
import type { ChartSummary } from "./astrology";

const SYSTEM_PROMPT = `You are Scorpio Rising — a warm, wise friend who knows the user's astrological chart. Your voice is intimate, luminous, and never clinical. You reflect people back to themselves with both warmth and intelligence.

Core rules (non-negotiable):
- You offer reflection and emotional support. You NEVER diagnose, treat, or claim clinical or therapeutic benefit. Do not use the words "therapy," "treatment," or "cure."
- You witness and hold space more than you instruct. Ask gentle questions; do not give orders.
- Keep it personal and specific to the chart details you are given.
- If someone expresses thoughts of self-harm or being in crisis, you MUST respond with care and surface crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line by texting HOME to 741741) rather than a reflection.

Write in a calm, poetic-but-grounded register. Short paragraphs. One gentle prompt at the end.`;

function buildPrompt(chart: ChartSummary, name?: string): string {
  const placements = chart.placements
    .map(
      (p) =>
        `${p.label} in ${p.sign}${p.retrograde ? " (retrograde)" : ""}`,
    )
    .join(", ");
  return `Write a short, warm "first reading" (about 160 words) for ${
    name ? name : "a new user"
  }.

Their chart:
- Sun in ${chart.sun}
- Moon in ${chart.moon}
- Rising (Ascendant) in ${chart.rising}${
    chart.risingApprox ? " (approximate — no exact birth time given)" : ""
  }
- Other placements: ${placements}

Make them feel seen. Gently weave in the chart. End with one reflective journaling question. Include a one-line note that this is reflection and support, not therapy.`;
}

/**
 * Generate a free "first reading" from the chart. If no ANTHROPIC_API_KEY is
 * configured (or the call fails), we fall back to a locally-generated reading
 * so the product experience always works.
 */
export async function generateReading(
  chart: ChartSummary,
  name?: string,
): Promise<string> {
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.anthropic;
  if (!apiKey) return fallbackReading(chart);

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(chart, name) }],
    });
    const textBlock: any = msg.content.find((b: any) => b.type === "text");
    return textBlock?.text?.trim() || fallbackReading(chart);
  } catch {
    return fallbackReading(chart);
  }
}

export function fallbackReading(chart: ChartSummary): string {
  const list = chart.placements
    .slice(0, 4)
    .map(
      (p) =>
        `${p.label} in ${p.sign}${p.retrograde ? " (retrograde)" : ""}`,
    )
    .join(", ");
  return [
    "Welcome. From the moment you were born, the sky was already writing your story.",
    "",
    `Your Sun rests in ${chart.sun} — the part of you that wants to be seen. Your Moon sits in ${chart.moon}, where you feel and heal. And you rise under ${chart.rising}${
      chart.risingApprox
        ? " (we used noon as an approximation since no birth time was given — your Rising sign becomes exact with your precise time)"
        : ""
    }, the face you show the world as you begin again.`,
    "",
    `Right now, in your chart: ${list}.`,
    "",
    "Here is what I'll offer as you open this journal: you don't have to arrive polished. The point isn't to be fine — it's to be honest. Write what you can't say out loud. I'll be here to reflect it back with warmth, and to remind you that the hard transits you're moving through are real, temporary, and meaningful.",
    "",
    "(This is a preview reflection. In the live app, every response is written uniquely to your entries and your chart — this is reflection and support, not therapy or clinical advice.)",
    "",
    "A question to begin: What are you carrying right now that you haven't named yet?",
  ].join("\n");
}
