
You picked all four scope groups plus AI content generator and a rebuild of Summarise Group Discussion. That's ~3 weeks of work compressed — I'll split it into 5 sequential phases, ~one chat turn each, so each ships clean and testable.

## Phase 1 — Foundation (THIS turn after approval)
- Enable Google sign-in (Lovable Cloud managed) on `/auth`, keep email/password
- New transparent SVG-style logo (generated, premium quality)
- Light/Dark/System theme switch in sidebar header + landing navbar (default Dark)
- Home page upgrades:
  - New hero with kinetic gradient background
  - Add: Video demo section (lazy-loaded `<video>` poster + play overlay)
  - Add: Testimonials carousel, Stats band, FAQ accordion, Logo strip ("trusted by")
  - Refine spacing/typography for enterprise feel
- Seed default admin: email `admin@pedagogistspte.com`, password `Admin@PTE2026` (you should change after first login)

## Phase 2 — Policy + User Settings
- `/privacy`, `/terms`, `/refund`, `/cookie` static pages with shared `PolicyLayout`
- `/settings` page: profile (display name, avatar upload via Storage), password change, theme, notifications toggle, danger zone (delete account)
- Add to sidebar footer + landing Footer

## Phase 3 — Admin Panel + Bulk Upload + Support
- `/admin` (gated by `has_role(auth.uid(),'admin')`):
  - Overview KPIs (users, subs, revenue, tickets)
  - Users table (search, role toggle)
  - Questions manager
  - **Bulk question upload**: drag-drop CSV/JSON card, schema preview, validation, insert
  - Support tickets inbox
- New tables: `support_tickets`, `support_messages` with RLS (user can manage own; admin can manage all)
- User-side `/support` page to create tickets + thread view

## Phase 4 — Checkout + Multi-currency (display)
- Currency selector (USD / BDT) in navbar, persisted in localStorage + `UserDataContext`
- Live FX (cached daily via edge function `fx-rates`)
- Pricing cards show converted BDT alongside USD (billing stays USD via Polar)
- Polish Polar checkout flow, success/cancel pages

## Phase 5 — AI Content Generator + GD Rebuild
- `/admin/generate` content generator: pick question type → Gemini produces N questions → preview → bulk insert
- Rebuild Summarise Group Discussion speaking module:
  - Real PTE format: 3-speaker discussion, 60–90s audio, 10s prep, 40s response
  - Generate 5 sample discussions (script + Gemini TTS audio files via `text-to-speech` function, stored in `discussion-audio` bucket)
  - New `GroupDiscussionTest` component with multi-speaker waveform display

## Technical details
- Theme: `ThemeProvider` already exists — extend to support `system` mode and persist to localStorage; add `<ThemeToggle />` using `next-themes`-style API (no extra dep, plain context)
- Google auth: call `supabase--configure_social_auth({providers:["google"]})` and use `lovable.auth.signInWithOAuth("google")`
- Admin seed: via `auth.admin.createUser` in a one-shot edge function, then insert into `user_roles`
- Bulk upload: client parses CSV with `papaparse`, validates via Zod, batches insert (admin RLS)
- Support tickets: new tables with `status` enum (open/pending/closed), realtime subscription for live updates
- FX: free `exchangerate.host` API, cached in a `fx_rates` table updated by daily cron edge function
- GD audio: generated once via `text-to-speech` edge function with 3 distinct voices, uploaded to public storage bucket, URLs stored in `questions.audio_url`

## What I need from you to start
Approve this plan and I'll execute **Phase 1** immediately. After Phase 1 ships, just reply "next" and I'll do Phase 2, and so on.
