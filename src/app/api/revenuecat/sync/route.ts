import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Called by the iOS app right after an Apple purchase or restore. Reads the
 * subscriber from RevenueCat (server-to-server) and unlocks the profile at
 * once, so the journal opens without waiting for the webhook. Never
 * downgrades anyone: web (Stripe) members are untouched.
 *
 * Auth: Authorization: Bearer <supabase access token> — the same pattern as
 * /api/subscription.
 */

const MEMBER_ENTITLEMENT = "member";

interface RCSubscriber {
  subscriber?: {
    entitlements?: Record<string, { expires_date: string | null; product_identifier?: string }>;
    subscriptions?: Record<string, { period_type?: string; expires_date?: string | null }>;
  };
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const jwt = auth.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // The v1 subscriber endpoint accepts the public app key; a secret key is used when present.
  const rcKey = process.env.REVENUECAT_SECRET_KEY || process.env.NEXT_PUBLIC_REVENUECAT_APPLE_KEY;
  if (!supabaseUrl || !anonKey || !rcKey) {
    return NextResponse.json({ hasPlan: false, reason: "not configured" });
  }

  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(jwt);
  if (userErr || !user) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  let rc: RCSubscriber;
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
      headers: { Authorization: `Bearer ${rcKey}`, "X-Platform": "ios", Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ hasPlan: false, reason: `revenuecat ${res.status}` });
    }
    rc = (await res.json()) as RCSubscriber;
  } catch {
    return NextResponse.json({ hasPlan: false, reason: "revenuecat unreachable" });
  }

  const ent = rc.subscriber?.entitlements?.[MEMBER_ENTITLEMENT];
  const expires = ent?.expires_date ? new Date(ent.expires_date).getTime() : null;
  const active = !!ent && (expires === null || expires > Date.now());
  if (!active) {
    return NextResponse.json({ hasPlan: false, reason: "no active member entitlement" });
  }

  const sub = ent?.product_identifier ? rc.subscriber?.subscriptions?.[ent.product_identifier] : undefined;
  const trialing = sub?.period_type === "trial";
  const status = trialing ? "trialing" : "active";

  const writer = serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    : createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
        global: { headers: { authorization: `Bearer ${jwt}` } },
      });
  const { error } = await writer
    .from("profiles")
    .update({
      plan: MEMBER_ENTITLEMENT,
      plan_status: status,
      trial_ends_at: trialing && ent?.expires_date ? ent.expires_date : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ hasPlan: true, status, reason: `profile update failed: ${error.message}` });
  }
  return NextResponse.json({ hasPlan: true, plan: MEMBER_ENTITLEMENT, status, reason: "ok (apple)" });
}
