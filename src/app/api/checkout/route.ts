import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PRICES: Record<string, string> = {
  mirror: "price_1U2PdsDG0j62nIpyFYFL69is",
  mirror_plus: "price_1U2PeADG0j62nIpyvJZitwlr",
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-11.basil" as Stripe.LatestApiVersion,
  });
  let plan = "mirror";
  let userId: string | null = null;
  let email: string | null = null;
  try {
    const body = await req.json();
    if (body.plan === "mirror_plus" || body.plan === "mirror+") plan = "mirror_plus";
    userId = body.userId || null;
    email = body.email || null;
  } catch {
    /* ignore */
  }
  const priceId = PRICES[plan];
  if (!priceId) return NextResponse.json({ error: "unknown plan" }, { status: 400 });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://scorpiorising.ai";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${base}/journal?paid=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      allow_promotion_codes: true,
      metadata: { plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
