"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { supabase } from "@/lib/supabaseClient";
import { openExternal, successHaptic, tapHaptic } from "@/lib/native";
import {
  getMemberPackages,
  purchaseMemberPackage,
  purchasesAvailable,
  restoreMemberPurchases,
  syncPlanWithServer,
  type MemberPackages,
} from "@/lib/purchases";

/**
 * The in-app paywall: Monthly + Annual from RevenueCat's `default` offering,
 * bought through Apple. Shown only inside the iOS app (the website uses
 * Stripe). Apple rule 3.1.1: no links to outside payment from here.
 */
export function NativePaywall({
  billing = "annual",
  onClose,
  compact = false,
}: {
  billing?: "monthly" | "annual";
  onClose?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [packages, setPackages] = useState<MemberPackages | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<"monthly" | "annual">(billing);
  const [busy, setBusy] = useState<"" | "buy" | "restore">("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!purchasesAvailable()) {
        setLoadError("Plans aren't available right now. Please try again in a moment.");
        return;
      }
      try {
        // StoreKit can sit silently (seen in the Simulator); don't leave the sheet on "Loading" forever.
        const p = await Promise.race([
          getMemberPackages(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 20000)),
        ]);
        if (!alive) return;
        if (!p.monthly && !p.annual) setLoadError("Plans aren't available right now. Please try again in a moment.");
        setPackages(p);
      } catch (e) {
        if (!alive) return;
        const why = (e as { message?: string })?.message || "";
        setLoadError(`Couldn't reach the App Store. Check your connection and try again.${why ? ` (${why.slice(0, 80)})` : ""}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function finish(unlocked: boolean) {
    const { data } = await supabase!.auth.getSession();
    await syncPlanWithServer(data.session?.access_token);
    await successHaptic();
    onClose?.();
    router.replace(unlocked ? "/journal?paid=apple" : "/journal");
  }

  async function buy() {
    const pkg = selected === "annual" ? packages?.annual : packages?.monthly;
    if (!pkg) return;
    await tapHaptic("medium");
    setBusy("buy");
    setMsg("");
    const out = await purchaseMemberPackage(pkg);
    setBusy("");
    if (out.cancelled) return;
    if (!out.ok) {
      setMsg(out.error || "The purchase could not be completed.");
      return;
    }
    await finish(true);
  }

  async function restore() {
    await tapHaptic();
    setBusy("restore");
    setMsg("");
    const out = await restoreMemberPurchases();
    setBusy("");
    if (out.ok) {
      await finish(true);
      return;
    }
    setMsg(out.error || "No previous membership was found for this Apple ID.");
  }

  const pkgFor = (k: "monthly" | "annual") => (k === "annual" ? packages?.annual : packages?.monthly) ?? null;

  return (
    <div className={`card-cream w-full ${compact ? "p-6" : "p-8"} text-center`} style={{ maxWidth: 440 }}>
      <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "#1aa37c" }}>Membership</p>
      <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.9rem", fontWeight: 300, color: "#17251f", lineHeight: 1.1 }}>
        Start free for 7 days.
      </h2>
      <p className="mt-2 text-sm" style={{ color: "#7a756e" }}>
        Unlimited reflections, daily sky, patterns and your long-term story. Cancel anytime.
      </p>

      {loadError ? (
        <p className="mt-6 text-sm" style={{ color: "#b23a3a" }}>{loadError}</p>
      ) : !packages ? (
        <p className="mt-6 text-sm" style={{ color: "#7a756e" }}>Loading plans…</p>
      ) : (
        <div className="mt-6 space-y-3 text-left">
          {(["annual", "monthly"] as const).map((k) => (
            <PlanRow key={k} kind={k} pkg={pkgFor(k)} selected={selected === k} onSelect={() => { setSelected(k); tapHaptic(); }} />
          ))}
        </div>
      )}

      <button
        onClick={buy}
        disabled={!!busy || !packages || !pkgFor(selected)}
        className="btn-phosphor mt-6 w-full disabled:opacity-60"
      >
        {busy === "buy" ? "Opening App Store…" : "Start 7-Day Free Trial"}
      </button>
      {msg && <p className="mt-3 text-sm" style={{ color: "#b23a3a" }}>{msg}</p>}

      <button onClick={restore} disabled={!!busy} className="mt-4 text-sm underline disabled:opacity-60" style={{ color: "#1aa37c" }}>
        {busy === "restore" ? "Restoring…" : "Restore purchases"}
      </button>

      <p className="mt-5 text-[11px] leading-relaxed" style={{ color: "#9a948b" }}>
        Payment is charged to your Apple ID when the free trial ends. The subscription renews automatically
        unless cancelled at least 24 hours before the end of the current period. Manage or cancel it in your
        iPhone Settings › Apple Account › Subscriptions.{" "}
        <button onClick={() => openExternal("https://www.scorpiorising.ai/terms")} className="underline">Terms</button>
        {" · "}
        <button onClick={() => openExternal("https://www.scorpiorising.ai/privacy")} className="underline">Privacy</button>
      </p>

      {onClose && (
        <button onClick={() => { tapHaptic(); onClose(); }} className="mt-4 text-xs uppercase tracking-[0.15em]" style={{ color: "#9a948b" }}>
          Not now
        </button>
      )}
    </div>
  );
}

function trialText(pkg: PurchasesPackage | null): string | null {
  const intro = pkg?.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  const n = intro.periodNumberOfUnits;
  const unit = intro.periodUnit.toLowerCase();
  return `${n} ${unit}${n === 1 ? "" : "s"} free`;
}

function PlanRow({
  kind,
  pkg,
  selected,
  onSelect,
}: {
  kind: "monthly" | "annual";
  pkg: PurchasesPackage | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const label = kind === "annual" ? "Annual" : "Monthly";
  const cadence = kind === "annual" ? "/year" : "/month";
  const perMonth = kind === "annual" && pkg?.product.pricePerMonthString ? `${pkg.product.pricePerMonthString}/mo billed yearly` : null;
  const trial = trialText(pkg);
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!pkg}
      className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition disabled:opacity-40"
      style={{
        borderColor: selected ? "#1fc896" : "rgba(23,37,31,0.15)",
        background: selected ? "rgba(31,200,150,0.10)" : "#fffdf8",
        boxShadow: selected ? "0 0 0 1px rgba(31,200,150,0.5)" : "none",
      }}
    >
      <span>
        <span className="flex items-center gap-2">
          <span className="font-medium" style={{ color: "#17251f" }}>{label}</span>
          {kind === "annual" && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: "#c5a46b", color: "#08201a" }}>
              Best value
            </span>
          )}
        </span>
        <span className="block text-xs" style={{ color: "#7a756e" }}>
          {trial ? `${trial}, then ` : ""}
          {pkg ? `${pkg.product.priceString}${cadence}` : "Unavailable"}
          {perMonth ? ` · ${perMonth}` : ""}
        </span>
      </span>
      <span
        className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: selected ? "#1fc896" : "rgba(23,37,31,0.3)", background: selected ? "#1fc896" : "transparent" }}
      >
        {selected && <span className="h-2 w-2 rounded-full" style={{ background: "#072019" }} />}
      </span>
    </button>
  );
}
