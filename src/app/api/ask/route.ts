import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReading } from "@/lib/anthropic";
import { calculateChart } from "@/lib/astrology";
import { geocodeCity } from "@/lib/geocode";

export const runtime = "nodejs";

function supabaseClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = (body.question || "").trim();
    if (!question) return NextResponse.json({ error: "Ask something first." }, { status: 400 });

    const supabase = supabaseClient(token);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Load profile + chart
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.chart || !profile.birth_date || !profile.birth_place) {
      return NextResponse.json(
        { error: "Set your birth chart first — Scorpio Rising needs it to answer personally." },
        { status: 409 }
      );
    }

    // Recompute the chart from stored birth data (chart may not carry lat/lon).
    const geo = await geocodeCity(profile.birth_place);
    if (!geo) {
      return NextResponse.json({ error: "Couldn't locate your birth place to build the chart." }, { status: 409 });
    }
    const [y, m, d] = profile.birth_date.split("-").map(Number);
    const hasTime = !!profile.birth_time && /\d{1,2}:\d{2}/.test(profile.birth_time);
    const hh = hasTime ? Number(profile.birth_time.slice(0, 2)) : 12;
    const mm = hasTime ? Number(profile.birth_time.slice(3, 5)) : 0;
    const chart = calculateChart(
      { year: y, month: m, day: d, hour: hh, minute: mm, latitude: geo.latitude, longitude: geo.longitude },
      !hasTime,
    );

    // Load recent entries for context
    const { data: entries } = await supabase
      .from("entries")
      .select("body, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    const recentEntries = (entries ?? []).map((e: any) => e.body);
    const recentTimeline = (entries ?? [])
      .map((e: any) => `${new Date(e.created_at).toLocaleDateString()}: ${e.body}`)
      .slice(-12);

    const reading = await generateReading({
      chart,
      name: profile.name || user.email || undefined,
      entry: `Question for Scorpio Rising: ${question}\n\nRecent journal history:\n${recentTimeline.join("\n")}`,
      recentEntries,
    });

    return NextResponse.json({ answer: reading });
  } catch (e: any) {
    console.error("ask failed:", e?.message || e);
    return NextResponse.json({ error: "The stars are quiet right now. Try again in a moment." }, { status: 500 });
  }
}
