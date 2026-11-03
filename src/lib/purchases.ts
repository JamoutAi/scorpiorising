import type { CustomerInfo, PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { isNativeApp } from "@/lib/native";

/**
 * RevenueCat (Apple in-app subscriptions). Only ever runs inside the native
 * app; the website keeps using Stripe. The RevenueCat app user id is always
 * the Supabase user id, so the webhook can find the profile to unlock.
 */

export const MEMBER_ENTITLEMENT = "member";

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
