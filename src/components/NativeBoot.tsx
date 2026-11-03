"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PluginListenerHandle } from "@capacitor/core";
import { useAuth } from "@/components/AuthProvider";
import { NativePaywall } from "@/components/NativePaywall";
import { hideSplash, isNativeApp, PAYWALL_EVENT, type PaywallRequest } from "@/lib/native";
import { syncPurchasesIdentity } from "@/lib/purchases";

/**
 * Runs only inside the iOS app shell. Sets up the status bar, deep links,
 * RevenueCat identity and the paywall sheet; sends the app's home screen to
 * the journal (or sign-up) instead of the marketing page. Renders nothing on
 * the website.
 */
export function NativeBoot() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Decided once on the client; the server render is null either way.
  const [native] = useState(() => typeof window !== "undefined" && isNativeApp());
  const [paywall, setPaywall] = useState<PaywallRequest | null>(null);

  // One-time native setup.
  useEffect(() => {
    if (!native) return;
    document.documentElement.classList.add("native-app");

    const handles: PluginListenerHandle[] = [];
    (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark }); // light text on the dark header
      } catch {
        /* ignore */
      }
      try {
        // Universal links (email links) → open the same path inside the app.
        const { App } = await import("@capacitor/app");
        handles.push(
          await App.addListener("appUrlOpen", (ev) => {
            try {
              const u = new URL(ev.url);
              if (/(^|\.)scorpiorising\.(ai|app)$/.test(u.hostname)) {
                window.location.assign(u.pathname + u.search + u.hash);
              }
            } catch {
              /* ignore malformed urls */
            }
          }),
        );
      } catch {
        /* ignore */
      }
      try {
        // Tapping the daily reminder lands on the journal.
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        handles.push(
          await LocalNotifications.addListener("localNotificationActionPerformed", (a) => {
            const route = (a.notification.extra as { route?: string } | undefined)?.route || "/journal";
            router.push(route);
          }),
        );
      } catch {
        /* ignore */
      }
    })();

    const onPaywall = (e: Event) => setPaywall((e as CustomEvent<PaywallRequest>).detail || {});
    window.addEventListener(PAYWALL_EVENT, onPaywall);
    return () => {
      window.removeEventListener(PAYWALL_EVENT, onPaywall);
      handles.forEach((h) => h.remove());
    };
  }, [native, router]);

  // The app opens on the journal, not the marketing homepage.
  useEffect(() => {
    if (!native || loading) return;
    if (pathname === "/") {
      router.replace(user ? "/journal" : "/start-trial");
      return;
    }
    hideSplash();
  }, [native, loading, user, pathname, router]);

  // Keep RevenueCat's user id equal to the Supabase user id.
  useEffect(() => {
    if (!native || loading) return;
    syncPurchasesIdentity(user?.id ?? null, user?.email ?? null);
  }, [native, loading, user?.id, user?.email]);

  if (!native || !paywall) return null;
  // The sheet scrolls when the card is taller than the screen. `mt-auto` pins
  // the card to the bottom on tall screens but, unlike `items-end`, never
  // pushes its top above the scrollable area on short ones.
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: "rgba(8, 32, 26, 0.92)", WebkitOverflowScrolling: "touch" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex min-h-full flex-col items-center p-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)", paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="mt-auto flex w-full justify-center sm:my-auto">
          <NativePaywall billing={paywall.billing} onClose={() => setPaywall(null)} compact />
        </div>
      </div>
    </div>
  );
}
