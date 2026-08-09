import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim() : undefined;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, source: "website" }, { onConflict: "email" });
    if (error) {
      // Don't leak DB errors to the client; still report success-ish.
      console.error("waitlist insert error", error);
    }
  } else {
    console.info(`[waitlist] would store: ${email} (Supabase not configured)`);
  }

  return NextResponse.json({ ok: true });
}
