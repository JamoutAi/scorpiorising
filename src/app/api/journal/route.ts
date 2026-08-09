import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocodeCity } from "@/lib/geocode";
import { calculateChart, type ChartSummary } from "@/lib/astrology";
import { generateReading } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function authError() {
  return NextResponse.json({ error: "auth_required" }, { status: 401 });
}

async function getUser(req: NextRequest) {
  if (!URL || !ANON) return null;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data } = await client.auth.getUser(token);
  return data.user ? client : null;
}

export async function GET(req: NextRequest) {
  const client = await getUser(req);
  if (!client) return authError();

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .maybeSingle();
  const { data: entries } = await client
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const { data: readings } = await client.from("readings").select("*");

  const byEntry = new Map((readings ?? []).map((r: any) => [r.entry_id, r]));
  const list = (entries ?? []).map((e: any) => ({
    id: e.id,
    body: e.body,
    created_at: e.created_at,
    reading: byEntry.get(e.id)?.content ?? null,
  }));

  return NextResponse.json({ profile: profile ?? null, entries: list });
}

export async function POST(req: NextRequest) {
  const client = await getUser(req);
  if (!client) return authError();

  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return authError();

  const body = await req.json();
  const action = body.action;

  // 1) Save birth chart profile.
  if (action === "saveProfile") {
    const { birthDate, birthTime, birthPlace, name } = body;
    if (!birthDate || !birthPlace) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const geo = await geocodeCity(birthPlace);
    if (!geo) {
      return NextResponse.json({ error: "place_not_found" }, { status: 400 });
    }
    const [y, m, d] = birthDate.split("-").map(Number);
    const hasTime = !!birthTime && /\d{1,2}:\d{2}/.test(birthTime);
    let hh = 12,
      mm = 0;
    if (hasTime) {
      [hh, mm] = birthTime.split(":").map(Number);
    }
    const chart: ChartSummary = calculateChart(
      {
        year: y,
        month: m,
        day: d,
        hour: hh,
        minute: mm,
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
      !hasTime,
    );

    const { data: profile, error } = await client
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: userData.user?.email,
          name: name || null,
          birth_date: birthDate,
          birth_time: hasTime ? birthTime : null,
          birth_place: birthPlace,
          chart,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ profile });
  }

  // 2) Add a journal entry + AI reflection.
  if (action === "addEntry") {
    const text = (body.entry || "").trim();
    if (!text) {
      return NextResponse.json({ error: "empty_entry" }, { status: 400 });
    }
    const { data: profile } = await client
      .from("profiles")
      .select("chart, name")
      .maybeSingle();
    const chart = profile?.chart as ChartSummary | null;

    // Pull recent entries for personalization context (exclude the one being written).
    const { data: recentRows } = await client
      .from("entries")
      .select("body")
      .order("created_at", { ascending: false })
      .limit(6);
    const recentEntries = (recentRows ?? []).map((r: any) => r.body);

    const { data: entry, error: entryErr } = await client
      .from("entries")
      .insert({ user_id: userId, body: text })
      .select()
      .single();
    if (entryErr || !entry) {
      return NextResponse.json(
        { error: entryErr?.message || "insert_failed" },
        { status: 500 },
      );
    }

    const reflection =
      chart?.sun && chart?.rising
        ? await generateReading({
            chart,
            name: profile?.name || undefined,
            entry: text,
            recentEntries,
          })
        : "Your entry is held. Add your birth chart to receive reflections written in the voice of your stars.";

    const { data: reading, error: readErr } = await client
      .from("readings")
      .insert({
        entry_id: entry.id,
        user_id: userId,
        content: reflection,
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      })
      .select()
      .single();
    if (readErr) {
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }

    return NextResponse.json({
      entry: { id: entry.id, body: entry.body, created_at: entry.created_at },
      reading: reading?.content ?? reflection,
    });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
