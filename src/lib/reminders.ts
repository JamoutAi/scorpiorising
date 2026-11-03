import { isNativeApp } from "@/lib/native";

/** Daily journaling nudge — a local notification scheduled on the phone. */

const REMINDER_ID = 7201;
const STORAGE_KEY = "scorpio:reminder";

export interface ReminderPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: ReminderPrefs = { enabled: false, hour: 20, minute: 30 };

export function loadReminderPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_REMINDER, ...parsed };
  } catch {
    return DEFAULT_REMINDER;
  }
}

function saveReminderPrefs(p: ReminderPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

const NUDGES = [
  "The stars are listening. What's on your mind today?",
  "A few lines tonight. Your chart will meet you there.",
  "Write it down before it fades — Scorpio Rising is ready.",
];

/** Returns false when the user declined notification permission. */
export async function enableDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") {
    saveReminderPrefs({ enabled: false, hour, minute });
    return false;
  }
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "Scorpio Rising",
        body: NUDGES[new Date().getDate() % NUDGES.length],
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
        extra: { route: "/journal" },
      },
    ],
  });
  saveReminderPrefs({ enabled: true, hour, minute });
  return true;
}

export async function disableDailyReminder(): Promise<void> {
  const prefs = loadReminderPrefs();
  saveReminderPrefs({ ...prefs, enabled: false });
  if (!isNativeApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch {
    /* ignore */
  }
}
