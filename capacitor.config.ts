import type { CapacitorConfig } from "@capacitor/cli";

// The iOS app is a native shell around the live, server-rendered site.
// For local testing, point it at a dev server with
//   CAP_SERVER_URL=http://localhost:3000 npx cap sync ios
// (the committed default is production).
const serverUrl = process.env.CAP_SERVER_URL || "https://www.scorpiorising.ai";

const config: CapacitorConfig = {
  appId: "ai.scorpiorising.app",
  appName: "Scorpio Rising",
  // Only holds the offline fallback page; the real app is loaded from server.url.
  webDir: "capacitor/www",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    // Pages on these hosts open inside the app instead of Safari.
    allowNavigation: ["www.scorpiorising.ai", "scorpiorising.ai", "*.supabase.co"],
    errorPath: "error.html",
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#0c2a23",
    scheme: "Scorpio Rising",
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      // Splash stays up until the web app calls SplashScreen.hide(), or 4s max.
      launchShowDuration: 4000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#0c2a23",
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      iconColor: "#1fc896",
    },
  },
};

export default config;
