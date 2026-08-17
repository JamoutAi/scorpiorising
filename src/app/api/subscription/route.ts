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
  const out = { hasPlan: false, plan: null as string | null, status: null as string | null, reason: "init" };

  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    out.reason = "missing env (stripe/supabase)";
    return NextResponse.json(out);
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const jwt = auth.slice(7);
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(jwt);
  if (userErr || !user) {
    out.reason = "auth: no user for token";
    return NextResponse.json(out);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  const email = user.email || "";
  out.reason = `looking up stripe customer for ${email}`;

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      out.reason = `no stripe customer for ${email}`;
      return NextResponse.json(out);
    }
    const custId = customers.data[0].id;
    // 1) Live subscription (active/trialing)?
    const subs = await stripe.subscriptions.list({ customer: custId, limit: 10 });
    const live = subs.data.filter((s) => s.status === "active" || s.status === "trialing");
    if (live.length > 0) {
      const sub = live[0];
      const priceId = sub.items.data[0]?.price.id;
      out.plan = PRICE_TO_PLAN[priceId || ""] || "mirror";
      out.status = sub.status;
      out.hasPlan = true;
      out.reason = "ok (subscription)";
      await sb
        .from("profiles")
        .update({ plan: out.plan, plan_status: sub.status === "trialing" ? "active" : sub.status })
        .eq("id", user.id);
      return NextResponse.json(out);
    }
    // 2) Completed checkout session but subscription still propagating? Grant access.
    const sessions = await stripe.checkout.sessions.list({
      customer: custId,
      limit: 5,
      expand: ["data.line_items.data"],
    });
    const completed = sessions.data.find(
      (s) => s.status === "complete" || s.payment_status === "paid" || s.payment_status === "no_payment_required",
    );
    if (completed) {
      const priceId = (completed.line_items?.data?.[0]?.price?.id as string) || "";
      out.plan = PRICE_TO_PLAN[priceId] || "mirror";
      out.status = "active";
      out.hasPlan = true;
      out.reason = "ok (completed checkout session)";
      await sb.from("profiles").update({ plan: out.plan, plan_status: "active" }).eq("id", user.id);
      return NextResponse.json(out);
    }
    out.reason = `customer exists, but no subscription and no completed checkout (sessions: ${sessions.data.map((s) => s.status).join(",")})`;
  } catch (e: any) {
    out.reason = `stripe error: ${e?.message || "unknown"}`;
  }

  return NextResponse.json(out);
}
