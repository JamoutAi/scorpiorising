import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Deletes the calling user's account and all their data (profiles, entries,
// readings, chats) via cascade. Auth via the user's own JWT; deletion performed
// with the service-role key (required for auth.admin.deleteUser).
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const jwt = auth.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceKey || !anonKey) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  // Resolve the caller from their JWT (anon client + RLS).
  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(jwt);
  if (userErr || !user) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  // Delete the auth user; cascade removes profiles/entries/readings/chats.
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
