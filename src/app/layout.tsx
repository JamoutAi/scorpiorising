import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.scorpiorising.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Scorpio Rising — Your AI Journaling Companion",
    template: "%s · Scorpio Rising",
  },
  description:
    "A subscription diary where every entry gets a thoughtful, personal response — written in the voice of someone who knows both your story and your chart.",
  keywords: [
    "AI journaling",
    "astrology",
    "journaling app",
    "natal chart",
    "emotional support",
    "Scorpio Rising",
  ],
  openGraph: {
    title: "Scorpio Rising — Your AI Journaling Companion",
    description:
      "A diary that knows your chart. Write freely; get a reflection written in the voice of someone who knows both your story and your stars.",
    url: siteUrl,
    siteName: "Scorpio Rising",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Scorpio Rising" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scorpio Rising — Your AI Journaling Companion",
    description:
      "A diary that knows your chart. Write freely; get a reflection written in the voice of someone who knows your stars.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/brand/favicon.svg",
    apple: "/brand/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');" }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
