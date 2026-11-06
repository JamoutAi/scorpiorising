import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateDailyReading, resolveLocalTime } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** A short fingerprint of the chart, so a changed birth chart gets a fresh reading. */
function chartKey(chart: { sun?: string; moon?: string; rising?: string }): string {
  return [chart.sun, chart.moon, chart.rising].map((s) => s || "").join("|");
}

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

  // Membership check: plan_status is kept current by the Stripe webhook.
  const { data: prof } = await client.from("profiles").select("plan_status").maybeSingle();
  const isMember =
    prof?.plan_status === "active" || prof?.plan_status === "trialing";
  if (!isMember) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const { data: profile } = await client.from("profiles").select("chart, name").maybeSingle();
  const chart = profile?.chart;
  if (!chart?.sun) {
    return NextResponse.json({ error: "no_chart" }, { status: 400 });
  }

  // The client tells us its time zone so "today" and the greeting match the user's clock.
  let timeZone: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.timeZone === "string" && body.timeZone.length < 64) timeZone = body.timeZone;
  } catch {
    /* no body — fall back to UTC */
  }
  const local = resolveLocalTime(timeZone);
  const key = chartKey(chart);

  // 1) Serve today's cached reading if we already have one for this chart.
  //    If the daily_readings table hasn't been created yet, caching is skipped silently.
  let cacheAvailable = true;
  const { data: cached, error: cacheErr } = await client
    .from("daily_readings")
    .select("content, chart_key")
    .eq("reading_date", local.dateISO)
    .maybeSingle();
  if (cacheErr) {
    cacheAvailable = false;
  } else if (cached?.content && cached.chart_key === key) {
    return NextResponse.json({ reading: cached.content, cached: true });
  }

  // 2) Otherwise generate once and store it for the rest of the day.
  const result = await generateDailyReading({ chart, name: profile?.name || undefined, local });
  if (result.generated && cacheAvailable) {
    await client
      .from("daily_readings")
      .upsert(
        {
          user_id: user.id,
          reading_date: local.dateISO,
          chart_key: key,
          content: result.text,
          model: result.model ?? null,
        },
        { onConflict: "user_id,reading_date" },
      );
  }
  return NextResponse.json({ reading: result.text, cached: false });
}
