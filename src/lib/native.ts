import { Capacitor } from "@capacitor/core";

/**
 * Native-app helpers. Everything here is a no-op in a normal browser, so the
 * website keeps its existing behaviour (Stripe checkout etc.).
 */

/** True only inside the iOS/Android app shell (Capacitor), never in a browser. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function isIOSApp(): boolean {
  return Capacitor.getPlatform() === "ios";
}

/** Light tap feedback for key buttons. */
export async function tapHaptic(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch {
    /* haptics are best-effort */
  }
}

/** "Something good happened" feedback (purchase done, chart saved). */
export async function successHaptic(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* best-effort */
  }
}

export async function hideSplash(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    /* best-effort */
  }
}

/** Opens a URL in the phone's browser (Safari) rather than inside the app. */
export function openExternal(url: string): void {
  window.open(url, "_blank", "noopener");
}

// ---- Paywall event bus -------------------------------------------------------
// Any page can call openPaywall(); <NativeBoot/> hosts the sheet and listens.

export const PAYWALL_EVENT = "scorpio:paywall";

export interface PaywallRequest {
  billing?: "monthly" | "annual";
}

export function openPaywall(req: PaywallRequest = {}): void {
  window.dispatchEvent(new CustomEvent<PaywallRequest>(PAYWALL_EVENT, { detail: req }));
}
