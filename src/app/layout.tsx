import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scorpiorising.ai";

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
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Scorpio Rising" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scorpio Rising — Your AI Journaling Companion",
    description:
      "A diary that knows your chart. Write freely; get a reflection written in the voice of someone who knows your stars.",
    images: ["/og.svg"],
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
