import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * RevenueCat → Supabase. Mirrors src/app/api/stripe/webhook/route.ts for
 * Apple in-app subscriptions: when the `member` entitlement starts, renews or
 * ends, update profiles.plan / plan_status for the matching user.
 *
 * RevenueCat dashboard → Integrations → Webhooks:
 *   URL:                  https://www.scorpiorising.ai/api/revenuecat/webhook
 *   Authorization header: the value of REVENUECAT_WEBHOOK_SECRET (Vercel)
 *
 * The RevenueCat app user id is the Supabase user id (set by the app), so
 * events map straight to a profile row; email is the fallback.
 */

export const MEMBER_ENTITLEMENT = "member";

const UNLOCK_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "NON_RENEWING_PURCHASE",
  "TRANSFER",
]);
// Access ends. (CANCELLATION only turns off auto-renew; access continues until
// EXPIRATION, exactly like Stripe's cancel_at_period_end.)
const LOCK_EVENTS = new Set(["EXPIRATION"]);

interface RCEvent {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  entitlement_ids?: string[] | null;
  product_id?: string;
  period_type?: string; // TRIAL | INTRO | NORMAL | PROMOTIONAL | PREPAID
  expiration_at_ms?: number | null;
  store?: string;
  environment?: string;
  subscriber_attributes?: Record<string, { value?: string }>;
  transferred_to?: string[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return header === secret || header === `Bearer ${secret}`;
}

/** Pick the Supabase user id out of the event (app_user_id or any alias). */
function userIdsFrom(ev: RCEvent): string[] {
  const ids = [ev.app_user_id, ev.original_app_user_id, ...(ev.aliases || []), ...(ev.transferred_to || [])];
  return Array.from(new Set(ids.filter((x): x is string => !!x && UUID.test(x))));
}

async function resolveProfileId(sb: SupabaseClient, ev: RCEvent): Promise<string | null> {
  for (const id of userIdsFrom(ev)) {
    const { data } = await sb.from("profiles").select("id").eq("id", id).maybeSingle();
    if (data?.id) return data.id as string;
  }
  const email = ev.subscriber_attributes?.["$email"]?.value;
  if (email) {
    const { data } = await sb.from("profiles").select("id").eq("email", email).maybeSingle();
    if (data?.id) return data.id as string;
  }
  return null;
}

/** A web member may also have an active Stripe subscription; never lock those out. */
async function hasLiveStripeSubscription(sb: SupabaseClient, profileId: string): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY) return false;
  try {
    const { data } = await sb.from("profiles").select("email").eq("id", profileId).maybeSingle();
    const email = (data?.email as string) || "";
    if (!email) return false;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) return false;
    const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, limit: 10 });
    return subs.data.some((s) => s.status === "active" || s.status === "trialing");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body: { event?: RCEvent };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const ev = body.event;
  if (!ev?.type) return NextResponse.json({ error: "missing event" }, { status: 400 });

  // Only the `member` entitlement unlocks the journal.
  const entitlements = ev.entitlement_ids || [];
  const concernsMember = entitlements.includes(MEMBER_ENTITLEMENT) || ev.type === "TEST";
  if (!concernsMember) return NextResponse.json({ received: true, ignored: "other entitlement" });

  if (ev.type === "TEST") return NextResponse.json({ received: true, test: true });

  const profileId = await resolveProfileId(sb, ev);
  if (!profileId) return NextResponse.json({ received: true, ignored: "no matching profile" });

  if (UNLOCK_EVENTS.has(ev.type)) {
    const trialing = ev.period_type === "TRIAL";
    await sb
      .from("profiles")
      .update({
        plan: MEMBER_ENTITLEMENT,
        plan_status: trialing ? "trialing" : "active",
        trial_ends_at: trialing && ev.expiration_at_ms ? new Date(ev.expiration_at_ms).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);
    return NextResponse.json({ received: true, applied: trialing ? "trialing" : "active" });
  }

  if (LOCK_EVENTS.has(ev.type)) {
    if (await hasLiveStripeSubscription(sb, profileId)) {
      return NextResponse.json({ received: true, ignored: "stripe subscription still active" });
    }
    await sb
      .from("profiles")
      .update({ plan_status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", profileId);
    return NextResponse.json({ received: true, applied: "canceled" });
  }

  // CANCELLATION, BILLING_ISSUE, SUBSCRIBER_ALIAS, SUBSCRIPTION_PAUSED, etc.
  return NextResponse.json({ received: true, ignored: ev.type });
}
