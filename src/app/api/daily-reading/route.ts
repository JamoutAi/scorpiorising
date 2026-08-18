import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateDailyReading } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!URL || !ANON) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const client = createClient(URL, ANON, {
    auth: { persistSession: false },
    global: { headers: { Authorization: auth } },
  });
  const {
    data: { user },
  } = await client.auth.getUser(auth.slice(7));
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Resolve plan from Stripe (authoritative) or profile. Any active paid plan = member.
  let isMember = false;
  try {
    const sub = await (await fetch(`${URL.replace(/\/$/, "")}/api/subscription`, { headers: { authorization: auth } })).json();
    isMember = sub.hasPlan === true;
  } catch {
    const { data: prof } = await client.from("profiles").select("plan, plan_status").maybeSingle();
    isMember = (prof?.plan_status === "active" || prof?.plan_status === "trialing");
  }
  if (!isMember) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const { data: profile } = await client.from("profiles").select("chart, name").maybeSingle();
  const chart = profile?.chart;
  if (!chart?.sun) {
    return NextResponse.json({ error: "no_chart" }, { status: 400 });
  }

  const reading = await generateDailyReading({ chart, name: profile?.name || undefined });
  return NextResponse.json({ reading });
}
