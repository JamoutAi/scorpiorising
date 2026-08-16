import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PLAN_BY_LINK: Record<string, string> = {
  "https://buy.stripe.com/eVq6oHaLmgfLani32P4Ni03": "mirror",
  "https://buy.stripe.com/6oU28rg5GaVr8fafPB4Ni02": "mirror_plus",
};

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function applyPlan(email: string, plan: string, trialEnd?: number | null) {
  if (!email) return;
  const sb = supabaseAdmin();
  const { data } = await sb.from("profiles").select("id").eq("email", email).maybeSingle();
  if (!data?.id) return;
  await sb
    .from("profiles")
    .update({
      plan,
      plan_status: "active",
      trial_ends_at: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
    })
    .eq("id", data.id);
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "missing signature/secret" }, { status: 400 });
  }
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (e: any) {
    return NextResponse.json({ error: `webhook error: ${e.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userEmail =
      (session.customer_email as string) ||
      ((session as any).customer_details?.email as string) ||
      "";
    const plan = (session.metadata?.plan as string) || PLAN_BY_LINK[session.url || ""] || "mirror";
    await applyPlan(userEmail, plan, (session as any).trial_end);
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const userEmail = (sub as any).customer_email || "";
    const status = (sub as any).status;
    if (userEmail) {
      const sb = supabaseAdmin();
      const { data } = await sb.from("profiles").select("id").eq("email", userEmail).maybeSingle();
      if (data?.id) {
        await sb
          .from("profiles")
          .update({ plan_status: status === "active" || status === "trialing" ? "active" : "canceled" })
          .eq("id", data.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
