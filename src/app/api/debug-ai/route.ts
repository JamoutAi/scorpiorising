import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const keySet =
    !!process.env.ANTHROPIC_API_KEY || !!process.env.anthropic;
  const keyName = process.env.ANTHROPIC_API_KEY
    ? "ANTHROPIC_API_KEY"
    : process.env.anthropic
      ? "anthropic"
      : "none";
  const keyPrefix = (
    (process.env.ANTHROPIC_API_KEY || process.env.anthropic || "")
  ).slice(0, 7);

  let callResult = "not attempted";
  if (keySet) {
    try {
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.anthropic!,
      });
      const msg = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
        max_tokens: 50,
        messages: [{ role: "user", content: "Say hi in 3 words." }],
      });
      callResult =
        "OK: " +
        (msg.content.find((b: any) => b.type === "text") as any)?.text;
    } catch (e: any) {
      callResult = "ERROR: " + (e?.message || String(e));
    }
  }

  return NextResponse.json({
    keySet,
    keyName,
    keyPrefix,
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
    callResult,
  });
}
