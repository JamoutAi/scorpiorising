import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const CANDIDATES = [
  "claude-3-5-haiku-latest",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-7-sonnet-latest",
  "claude-3-7-sonnet-20250219",
];

export async function GET(_req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY || process.env.anthropic;
  if (!key) return NextResponse.json({ error: "no key" });

  const client = new Anthropic({ apiKey: key });
  const results: Record<string, string> = {};

  for (const model of CANDIDATES) {
    try {
      const msg = await client.messages.create({
        model,
        max_tokens: 20,
        messages: [{ role: "user", content: "Say hi in 3 words." }],
      });
      const t = (msg.content.find((b: any) => b.type === "text") as any)?.text;
      results[model] = "OK: " + t;
    } catch (e: any) {
      results[model] = "ERR: " + (e?.message || String(e));
    }
  }

  return NextResponse.json({ results });
}
