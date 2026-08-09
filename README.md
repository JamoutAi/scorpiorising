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
