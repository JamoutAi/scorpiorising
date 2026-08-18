import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PRICES: Record<string, { id: string; annual: boolean }> = {
  monthly: { id: "price_1U5sUIDG0j62nIpyaesyJnVx", annual: false }, // $12/mo
  annual: { id: "price_1U5sUZDG0j62nIpytP3oJOGL", annual: true }, // $99/yr
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  let billing: "monthly" | "annual" = "monthly";
  let userId: string | null = null;
  let email: string | null = null;
  try {
    const body = await req.json();
    if (body.billing === "annual") billing = "annual";
    userId = body.userId || null;
    email = body.email || null;
  } catch {
    /* ignore */
  }
  const price = PRICES[billing];
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://scorpiorising.ai";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      line_items: [{ price: price.id, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${base}/journal?paid=${billing}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      allow_promotion_codes: true,
      metadata: { plan: "member", billing },
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
