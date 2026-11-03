import type { CustomerInfo, PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { isNativeApp } from "@/lib/native";

/**
 * RevenueCat (Apple in-app subscriptions). Only ever runs inside the native
 * app; the website keeps using Stripe. The RevenueCat app user id is always
 * the Supabase user id, so the webhook can find the profile to unlock.
 */

export const MEMBER_ENTITLEMENT = "member";
export const MEMBER_PRODUCT_IDS = ["ai.scorpiorising.app.member.annual", "ai.scorpiorising.app.member.monthly"];

type Purchases = typeof import("@revenuecat/purchases-capacitor").Purchases;

let configured = false;
let configuredFor: string | null = null;

async function sdk(): Promise<Purchases> {
  const mod = await import("@revenuecat/purchases-capacitor");
  return mod.Purchases;
}

export function purchasesAvailable(): boolean {
  return isNativeApp() && !!process.env.NEXT_PUBLIC_REVENUECAT_APPLE_KEY;
}

/**
 * Configure the SDK once, then keep its identity in step with Supabase auth.
 * Safe to call repeatedly (on every auth change).
 */
export async function syncPurchasesIdentity(userId: string | null, email?: string | null): Promise<boolean> {
  if (!purchasesAvailable()) return false;
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_APPLE_KEY as string;
  const Purchases = await sdk();
  try {
    if (!configured) {
      if (process.env.NODE_ENV !== "production") {
        const { LOG_LEVEL } = await import("@revenuecat/purchases-capacitor");
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      }
      await Purchases.configure({ apiKey, appUserID: userId ?? undefined });
      configured = true;
      configuredFor = userId;
    } else if (userId && configuredFor !== userId) {
      await Purchases.logIn({ appUserID: userId });
      configuredFor = userId;
    } else if (!userId && configuredFor) {
      try {
        await Purchases.logOut();
      } catch {
        /* already anonymous */
      }
      configuredFor = null;
    }
    if (userId && email) {
      try {
        await Purchases.setEmail({ email });
      } catch {
        /* attribute is optional */
      }
    }
    return true;
  } catch (e) {
    console.warn("[Scorpio Rising] RevenueCat setup failed", e);
    return false;
  }
}

export interface MemberPackages {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
}

/** The Monthly + Annual packages from the `default` offering. */
export async function getMemberPackages(): Promise<MemberPackages> {
  const Purchases = await sdk();
  const { current, all } = await Purchases.getOfferings();
  const offering = current ?? all["default"] ?? null;
  if (!offering) return { monthly: null, annual: null };
  const byType = (t: string) => offering.availablePackages.find((p) => p.packageType === t) ?? null;
  return {
    monthly: offering.monthly ?? byType("MONTHLY"),
    annual: offering.annual ?? byType("ANNUAL"),
  };
}

export function hasMemberEntitlement(info: CustomerInfo | null | undefined): boolean {
  return !!info?.entitlements?.active?.[MEMBER_ENTITLEMENT];
}

export interface PurchaseOutcome {
  ok: boolean;
  cancelled: boolean;
  customerInfo: CustomerInfo | null;
  error?: string;
}

function isCancelledError(e: unknown): boolean {
  const err = e as { code?: unknown; readableErrorCode?: unknown; userCancelled?: unknown; message?: unknown } | null;
  if (!err) return false;
  if (err.userCancelled === true) return true;
  // Capacitor surfaces the RevenueCat error code as a string ("1" == PURCHASE_CANCELLED_ERROR).
  if (String(err.code) === "1") return true;
  if (typeof err.readableErrorCode === "string" && err.readableErrorCode.includes("CANCELLED")) return true;
  if (typeof err.message === "string" && /cancel/i.test(err.message)) return true;
  return false;
}

export async function purchaseMemberPackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  const Purchases = await sdk();
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return { ok: hasMemberEntitlement(customerInfo), cancelled: false, customerInfo };
  } catch (e) {
    if (isCancelledError(e)) return { ok: false, cancelled: true, customerInfo: null };
    const msg = (e as { message?: string })?.message || "The purchase could not be completed.";
    return { ok: false, cancelled: false, customerInfo: null, error: msg };
  }
}

export async function restoreMemberPurchases(): Promise<PurchaseOutcome> {
  const Purchases = await sdk();
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return { ok: hasMemberEntitlement(customerInfo), cancelled: false, customerInfo };
  } catch (e) {
    const msg = (e as { message?: string })?.message || "Could not restore purchases.";
    return { ok: false, cancelled: false, customerInfo: null, error: msg };
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    const Purchases = await sdk();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch {
    return null;
  }
}

/**
 * Ask our server to read the subscription from RevenueCat and unlock the
 * profile right away (the webhook does the same thing a few seconds later and
 * keeps it current afterwards).
 */
export async function syncPlanWithServer(accessToken: string | undefined): Promise<boolean> {
  if (!accessToken) return false;
  try {
    const res = await fetch("/api/revenuecat/sync", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    return !!json.hasPlan;
  } catch {
    return false;
  }
}

/**
 * One-line health check shown under the paywall when plans fail to load, so a
 * screenshot from a tester tells us where it stopped (SDK, App Store, or products).
 */
export async function purchasesDiagnostics(onUpdate?: (text: string) => void): Promise<string> {
  const parts: string[] = [];
  const push = (t: string) => {
    parts.push(t);
    onUpdate?.(parts.join(" · "));
  };
  const withTimeout = <T,>(p: Promise<T>, ms: number) =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms / 1000}s`)), ms))]);
  const errText = (e: unknown) => {
    const err = e as { code?: unknown; message?: unknown; readableErrorCode?: unknown; underlyingErrorMessage?: unknown } | null;
    return [err?.readableErrorCode, err?.code, err?.message, err?.underlyingErrorMessage].filter(Boolean).join(" ").slice(0, 160);
  };
  try {
    push("start");
    try {
      await withTimeout(import("@capacitor/status-bar"), 5000);
      push("control import ok");
    } catch (e) {
      push(`control import: ${errText(e)}`);
    }
    const Purchases = await withTimeout(sdk(), 10000);
    push("sdk loaded");
    try {
      const c = await withTimeout(Purchases.isConfigured(), 3000);
      push(`sdk ${c.isConfigured ? "configured" : "NOT configured"}`);
    } catch (e) {
      push(`isConfigured: ${errText(e)}`);
    }
    try {
      const u = await withTimeout(Purchases.getAppUserID(), 3000);
      push(`user ${u.appUserID.slice(0, 8)}…`);
    } catch (e) {
      push(`appUserID: ${errText(e)}`);
    }
    try {
      const c = await withTimeout(Purchases.canMakePayments(), 3000);
      push(`payments ${c.canMakePayments ? "allowed" : "BLOCKED"}`);
    } catch (e) {
      push(`canMakePayments: ${errText(e)}`);
    }
    const t0 = Date.now();
    try {
      const r = await withTimeout(Purchases.getProducts({ productIdentifiers: MEMBER_PRODUCT_IDS }), 15000);
      const ids = r.products.map((x) => x.identifier.split(".").pop()).join(",");
      push(`products ${r.products.length} [${ids}] in ${Math.round((Date.now() - t0) / 1000)}s`);
    } catch (e) {
      push(`products: ${errText(e)} after ${Math.round((Date.now() - t0) / 1000)}s`);
    }
  } catch (e) {
    push(`sdk load: ${errText(e)}`);
  }
  return parts.join(" · ");
}
