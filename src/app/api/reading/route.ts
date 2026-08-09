import { NextRequest, NextResponse } from "next/server";
import { geocodeCity } from "@/lib/geocode";
import { calculateChart } from "@/lib/astrology";
import { generateReading, fallbackReading } from "@/lib/anthropic";

function toInt(v: string | null): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

// Render a simple results page (server-rendered HTML in the response).
function renderResults(params: {
  name?: string;
  risingApprox: boolean;
  chart: ReturnType<typeof calculateChart>;
  reading: string;
  placeName: string;
}) {
  const { risingApprox, chart, reading, placeName } = params;
  const paras = reading
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/</g, "&lt;")}</p>`)
    .join("");

  const placements = chart.placements
    .map(
      (p) =>
        `<li><span class="k">${p.label}</span> in <span class="s">${p.sign}</span>${
          p.retrograde ? ' <span class="r">(retrograde)</span>' : ""
        }</li>`,
    )
    .join("");

  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Your First Reading · Scorpio Rising</title>
<style>
  :root{--ink:#2b1b4d;--ink-soft:#3d2a66;--mint:#b9f5e0;--paper:#fff}
  *{box-sizing:border-box}
  body{margin:0;font-family:ui-sans-serif,system-ui,Helvetica,Arial;color:var(--ink);background:#f6f4fb;line-height:1.6}
  .wrap{max-width:720px;margin:0 auto;padding:48px 20px 80px}
  .badge{display:inline-block;font-size:12px;letter-spacing:.25em;text-transform:uppercase;color:var(--ink-soft)}
  h1{font-family:Georgia,serif;font-size:34px;margin:8px 0 4px}
  .sub{color:#6b6390;margin:0 0 28px}
  .chart{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 28px}
  .chip{background:var(--ink);color:var(--mint);border-radius:999px;padding:8px 16px;font-size:14px;font-weight:600}
  .panel{background:#fff;border:1px solid rgba(43,27,77,.08);border-radius:20px;padding:28px 28px;box-shadow:0 8px 30px rgba(43,27,77,.05)}
  .panel p{margin:0 0 14px}
  .panel p:last-child{margin-bottom:0}
  .disclaimer{margin-top:18px;font-size:13px;color:#6b6390;border-top:1px solid rgba(43,27,77,.08);padding-top:14px}
  .placements{margin:18px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px}
  .placements li{background:#f6f4fb;border:1px solid rgba(43,27,77,.08);border-radius:10px;padding:6px 12px;font-size:13px}
  .k{font-weight:600}.s{color:var(--ink-soft)}.r{color:#b07}
  .cta{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}
  a.btn{background:var(--ink);color:#fff;text-decoration:none;border-radius:999px;padding:13px 26px;font-weight:600;font-size:14px}
  a.ghost{background:#fff;color:var(--ink);border:1px solid rgba(43,27,77,.15);text-decoration:none;border-radius:999px;padding:13px 26px;font-weight:600;font-size:14px}
</style></head>
<body><div class="wrap">
  <span class="badge">Your First Reading</span>
  <h1>Your rising sign is your story.</h1>
  <p class="sub">Born in ${placeName.replace(/</g, "&lt;")}${
    risingApprox
      ? " · Rising sign approximate (no exact birth time given)"
      : ""
  }</p>
  <div class="chart">
    <span class="chip">Sun in ${chart.sun}</span>
    <span class="chip">Moon in ${chart.moon}</span>
    <span class="chip">Rising in ${chart.rising}</span>
  </div>
  <ul class="placements">${placements}</ul>
  <div class="panel" style="margin-top:22px">${paras}</div>
  <p class="disclaimer">This is a reflection and a moment of support — not therapy, diagnosis, or clinical advice. If you are in crisis, call or text 988 (US) or text HOME to 741741.</p>
  <div class="cta">
    <a class="btn" href="/reading">Write your next entry</a>
    <a class="ghost" href="/">Back to Scorpio Rising</a>
  </div>
</div></body></html>`;
  return html;
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const birthDate = (form.get("birthDate") as string) || "";
  const birthTime = (form.get("birthTime") as string) || "";
  const birthPlace = (form.get("birthPlace") as string) || "";
  const name = (form.get("name") as string) || undefined;

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!dateMatch) {
    return NextResponse.redirect(new URL("/reading?err=date", req.url), 303);
  }
  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);
  if (year < 1900 || year > new Date().getFullYear()) {
    return NextResponse.redirect(new URL("/reading?err=date", req.url), 303);
  }

  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(birthTime);
  const hour = timeMatch ? toInt(timeMatch[1])! : 12; // default noon if unknown
  const minute = timeMatch ? toInt(timeMatch[2])! : 0;
  const risingApprox = !timeMatch;

  const geo = await geocodeCity(birthPlace);
  if (!geo) {
    // Let them retry with a clearer error via query param.
    return NextResponse.redirect(
      new URL(`/reading?err=place&q=${encodeURIComponent(birthPlace)}`, req.url),
      303,
    );
  }

  let chart;
  try {
    chart = calculateChart(
      { year, month, day, hour, minute, latitude: geo.latitude, longitude: geo.longitude },
      risingApprox,
    );
  } catch (e) {
    console.error("chart calc failed", e);
    return NextResponse.redirect(new URL("/reading?err=chart", req.url), 303);
  }

  const reading = await generateReading(chart, name);
  const placeName = geo.country ? `${geo.name}, ${geo.country}` : geo.name;

  const html = renderResults({ name, risingApprox, chart, reading, placeName });
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
