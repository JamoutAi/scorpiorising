import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY || process.env.anthropic;
  if (!key) return NextResponse.json({ error: "no key" });

  const client = new Anthropic({ apiKey: key });

  // 1) Does the key authenticate at all? Try the models.list endpoint.
  let listResult = "not attempted";
  try {
    const models = await client.models.list();
    listResult =
      "OK count=" + models.data.length + " :: " +
      models.data.slice(0, 8).map((m) => m.id).join(", ");
  } catch (e: any) {
    listResult = "ERR: " + (e?.message || String(e));
  }

  // 2) Try a tiny real completion with one of the newest aliases.
  let callResult = "not attempted";
  for (const model of [
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-5-20251101",
  ]) {
    try {
      const msg = await client.messages.create({
        model,
        max_tokens: 20,
        messages: [{ role: "user", content: "hi" }],
      });
      callResult = model + " OK: " + (msg.content.find((b: any) => b.type === "text") as any)?.text;
      break;
    } catch (e: any) {
      callResult = model + " ERR: " + (e?.message || String(e));
    }
  }

  return NextResponse.json({ listResult, callResult });
}
