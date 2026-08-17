import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PRICE_TO_PLAN: Record<string, string> = {
  "price_1U2PdsDG0j62nIpyFYFL69is": "mirror",
  "price_1U2PeADG0j62nIpyvJZitwlr": "mirror_plus",
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  // Resolve the calling user from the JWT.
  const jwt = auth.slice(7);
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(jwt);
  if (userErr || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  const email = user.email || "";

  // Find the customer by email, then any active/trialing subscription.
  let plan: string | null = null;
  let status: string | null = null;
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const custId = customers.data[0]?.id;
    if (custId) {
      const subs = await stripe.subscriptions.list({
        customer: custId,
        status: "active",
        limit: 5,
      });
      if (subs.data.length === 0) {
        const trialing = await stripe.subscriptions.list({
          customer: custId,
          status: "trialing",
          limit: 5,
        });
        if (trialing.data.length > 0) {
          subs.data.push(...trialing.data);
        }
      }
      for (const sub of subs.data) {
        if (sub.status === "active" || sub.status === "trialing") {
          const priceId = sub.items.data[0]?.price.id;
          plan = PRICE_TO_PLAN[priceId || ""] || "mirror";
          status = sub.status;
          break;
        }
      }
    }
  } catch {
    // If Stripe lookup fails, fall through to DB-only.
  }

  // Sync to the profile so the rest of the app is consistent.
  if (plan && status) {
    await sb
      .from("profiles")
      .update({ plan, plan_status: status === "trialing" ? "active" : status })
      .eq("id", user.id);
  }

  return NextResponse.json({ hasPlan: !!plan, plan, status });
}
