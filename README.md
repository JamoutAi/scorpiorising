# Scorpio Rising

A subscription AI journaling companion with an astrological soul. "A wise, warm
friend who knows your chart." Built with Next.js (App Router) + TypeScript +
Tailwind v4, deployable to Vercel.

**Live:** https://scorpiorising.ai  ·  **Secondary:** https://scorpiorising.app (redirects)

## What's in Phase 1 (this repo)
- **Marketing site** — Hero ("You've been writing in the dark. We brought the
  stars."), Core Loop, Magic Features, Founder Story, Pricing, Waitlist.
- **Free "first reading" lead magnet** — `/reading`: enter birth date/time/place →
  server computes your natal chart (local ephemeris, no external astro API) → a
  warm, chart-aware reflection. Top of funnel.
- **Legal pages** — Privacy, Terms, Support (with 988 / Crisis Text Line handoff).
- **SEO** — sitemap.xml, robots.txt, Open Graph image, metadata.

## Stack
- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4
- Chart engine: `circular-natal-horoscope-js` (runs server-side)
- Geocoding: Open-Meteo geocoding API (no key required)
- AI: Anthropic SDK (optional — graceful local fallback if unset)
- Backend/DB (Phase 2+): Supabase · Payments: Stripe

## Local dev
```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY for live readings
npm run dev                  # http://localhost:3000
```
The app runs fully **without** any API keys: the waitlist logs to console (or
Supabase if configured), and readings use a built-in local fallback.

## Environment variables
| Var | Required? | Purpose |
|-----|----------|---------|
| `ANTHROPIC_API_KEY` | No | Live AI readings; without it, local fallback is used. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-3-5-haiku-20241022`. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL for waitlist persistence. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only write to `waitlist` table. |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for metadata/SEO. |

### Supabase (optional)
1. Create a project at supabase.com.
2. Run: `create table waitlist (id bigint generated always as identity primary key, email text unique not null, source text, created_at timestamptz default now());`
3. Enable Row Level Security but allow the service role (server) to insert.

## Deploy to Vercel + wire domains
1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo. Framework = Next.js (auto-detected).
3. Add the env vars above (Project → Settings → Environment Variables).
4. Deploy. Vercel gives you a `*.vercel.app` URL.
5. **Domains:** Project → Settings → Domains → add `scorpiorising.ai` and
   `scorpiorising.app`. Vercel shows DNS records (typically A + CNAME). Add them
   at your registrar. Set `scorpiorising.app` to **redirect** to
   `scorpiorising.ai`.
6. Once DNS propagates, the site is live on both domains.

## Project status
Phase 1 (website + free reading) is complete and tested. Next phases (per the
plan): product MVP (onboarding + core journal loop), memory across entries,
transit-timed check-ins, freemium payments, native app.

## iOS app (App Store)

The iPhone app is a native shell (Capacitor) around the live site: it opens
`https://www.scorpiorising.ai` inside the app, so every web deploy updates the
app too. Native extras live in `ios/` (Xcode project), `capacitor.config.ts`,
and `src/lib/native.ts` / `src/lib/purchases.ts` / `src/lib/reminders.ts`.

What is different inside the app (the website is unchanged):
- **Subscriptions go through Apple**, not Stripe. The paywall
  (`src/components/NativePaywall.tsx`) shows the Monthly and Annual plans from
  RevenueCat's `default` offering; a purchase unlocks the journal via
  `/api/revenuecat/sync` immediately and `/api/revenuecat/webhook` keeps it
  current (renewals, expiry). Existing web members just sign in — nothing to buy.
- The app opens on the journal (or sign-up), not the marketing page.
- Daily journaling reminder (Settings → Daily reminder), haptic taps, and
  `scorpiorising.ai` links open inside the app (`public/.well-known/apple-app-site-association`).

### Vercel environment variables for the app
| Var | Where | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_REVENUECAT_APPLE_KEY` | Production (already set) | RevenueCat public Apple key; the app and `/api/revenuecat/sync` use it. |
| `REVENUECAT_WEBHOOK_SECRET` | Production — **add this** | Any long random string. Paste the same value in RevenueCat → Integrations → Webhooks → Authorization header, with URL `https://www.scorpiorising.ai/api/revenuecat/webhook`. |
| `REVENUECAT_SECRET_KEY` | optional | A RevenueCat secret API key; if set, `/api/revenuecat/sync` uses it instead of the public key. |

### Build and upload to TestFlight (plain English)
1. In Terminal, inside the project folder, run `npm install` then `npm run ios:sync`
   (this copies the app settings and plugins into the Xcode project).
2. Run `npm run ios:open` — Xcode opens the project.
3. **First time only:** plug your iPhone into the Mac with a cable, unlock it,
   and pick it as the destination at the top of Xcode (Xcode registers the phone
   with your developer account and creates the signing certificate; say yes to
   any "Trust"/keychain prompts). Without a registered phone Xcode says
   "Your team has no devices" and refuses to archive.
4. Then choose **Any iOS Device (arm64)** as the destination.
5. Menu **Product → Archive**. Wait for the "Archives" window to appear.
6. Click **Distribute App → App Store Connect → Upload**, keep every default,
   and click **Upload**. Xcode signs it with the MYJAMS LLC team automatically.
7. After 5–15 minutes the build shows up in App Store Connect → TestFlight.
   Add yourself as an internal tester and install from the TestFlight app.

To bump the version for a new upload: in Xcode select the **App** target →
**General** → change **Version** (e.g. 1.0.1) and **Build** (any higher number).

To test on the iOS Simulator against a local server instead of production:
```bash
CAP_SERVER_URL=http://localhost:3000 npm run ios:sync
```
then run `npm run dev` and press Run in Xcode. Run `npm run ios:sync` again
(without the variable) before archiving so the app points at production.

If the app icon or splash screen changes: replace `assets/icon-only.png`,
`assets/splash.png`, `assets/splash-dark.png` and run `npm run ios:assets`.
