import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Creates a Stripe Customer Portal session so a member can manage/cancel their
// subscription and payment method. Auth via the user's own JWT.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const jwt = auth.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!process.env.STRIPE_SECRET_KEY || !supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(jwt);
  if (userErr || !user) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  try {
    const customers = await stripe.customers.list({ email: user.email || "", limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ error: "no customer" }, { status: 404 });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.scorpiorising.ai"}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
