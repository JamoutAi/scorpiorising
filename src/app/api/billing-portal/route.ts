import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: auth } },
  });
  const {
    data: { user },
  } = await sb.auth.getUser(auth.slice(7));
  if (!user?.email) return NextResponse.json({ error: "no_user" }, { status: 401 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  const custId = customers.data[0]?.id;
  if (!custId) {
    return NextResponse.json({ error: "no_customer", url: "/pricing" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: custId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.scorpiorising.ai"}/profile`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    // Portal not configured in Stripe → send to pricing as a fallback.
    return NextResponse.json({ error: "portal_not_configured", url: "/pricing" });
  }
}
