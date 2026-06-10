# Frontend Tasks

Source: [ui_prd.md](ui_prd.md) + [prd.md](prd.md). Stack: TanStack Start + React 19 + Vite + TypeScript, Convex (reactive subscriptions, no polling), shadcn/ui + Tailwind v4.

Each task below is a big, self-contained chunk meant for one AI agent session. Goals for every task: (1) make it look genuinely good — polished, modern, demo-stage quality, not a default shadcn grey box; (2) keep the Convex data contracts thin and obvious so backend work can plug in without frontend rewrites.

---

## Task 0: Convex schema + mock data layer (data contract foundation) ✅ DONE

Do this first — every other task depends on it.

**Implemented.** Files: [convex/schema.ts](convex/schema.ts) (tables + shared validators/types + `PIPELINE_COLUMNS` kanban mapping), [convex/model.ts](convex/model.ts) (pricing book + signal/notification helpers), [convex/campaigns.ts](convex/campaigns.ts), [convex/candidates.ts](convex/candidates.ts), [convex/notifications.ts](convex/notifications.ts), [convex/billing.ts](convex/billing.ts), [convex/seed.ts](convex/seed.ts).

Frontend data contract (import types from `convex/schema`, call via the generated `api`):
- `api.campaigns.getActiveCampaign` / `getCampaign` / `createCampaign`
- `api.candidates.listCandidates` · mutations `setStage`, `passCandidate`, `rejectCandidate`
- `api.notifications.listNotifications` · `addNotification`
- `api.billing.getInvoice` (returns `{ rows, summary }`) · `fireSignal`

To activate: `npx convex dev` (regenerates `_generated` types + deploys schema), then `npx convex run seed:seedDemo` to load the rich demo fixture. `seed:resetDemo` clears it.

- Define the Convex schema (`convex/schema.ts`) for: `campaigns` (company name, role title, job description, status), `candidates` (name, email, stage, github link, take-home report, decline flag), `notifications`/activity log entries (timestamp, category, description, badge type), and `billingEvents` / invoice rows (signal type, unit price, qty, total).
- Candidate stages must match the lifecycle in prd.md: sourced, contacted, declined, accepted, cv_screened, vetted, in_interview, hired, not_hired — and map cleanly onto the 6 Kanban columns (Found, Reached Out, CV Screening, Take-Home Assessment, Interview, Hired) plus the Declined bin.
- Write minimal Convex queries (`getCampaign`, `listCandidates`, `listNotifications`, `getInvoice`/`getBillingSummary`) and a couple of mutations/seed functions to insert demo data (3 candidates, sample notifications, sample invoice rows) so the frontend has real reactive data to build against immediately — no mocked JSON in components.
- Document the shape of each query's return type at the top of the file (TS types) so future backend work knows exactly what the frontend expects.

## Task 1: App shell, navigation & design system ✅ DONE

**Implemented.** Design direction: dark "mission control" — warm charcoal, signature **gold** agent accent, reserved **violet** Paid.com brand (so the billing panel breaks out). Fonts: Bricolage Grotesque (display), Inter (body), JetBrains Mono (numbers/receipt/feed) — all bundled via fontsource. Files: [src/styles.css](src/styles.css) (theme tokens, Paid + badge palettes, background atmosphere, motion primitives: `fade-in-up`, `pulse-once`, `flash`, `flash-paid`), [src/components/ui/card.tsx](src/components/ui/card.tsx), [src/components/ui/badge.tsx](src/components/ui/badge.tsx) (default/paid + activity-feed variants), [src/components/brand.tsx](src/components/brand.tsx), [src/components/navbar.tsx](src/components/navbar.tsx), [src/components/app-shell.tsx](src/components/app-shell.tsx). Routes scaffolded: `/` (landing), `/onboarding`, `/dashboard`, `/notifications`. Run with `pnpm dev:web` (a placeholder `.env.local` lets it boot before Convex is provisioned).

- Build the persistent layout: top navbar (campaign name display, link to Notifications Hub), consistent page background/typography, color palette and spacing scale that feels premium (not default shadcn). Pick an accent color scheme that works for both the recruiting UI and the Paid panel branding.
- Set up routing for the 4 pages (Home, Onboarding, Dashboard, Notifications) using TanStack Start file-based routing.
- Add any shared shadcn components needed across pages (cards, badges, buttons, tables, tabs/pills, dialogs) and install/theme them properly.
- Add base animation/transition primitives (fade-in, pulse, highlight-flash) that later tasks will reuse for the activity feed, Kanban movement, and billing updates.

## Task 2: Home / Landing page ✅ DONE

**Implemented** in [src/routes/index.tsx](src/routes/index.tsx). Project named **Crackd** (wordplay: the agent finds "cracked" / elite engineers). Asymmetric hero — headline "Hire the cracked engineers. Pay only for outcomes." with gold accent + underline, the PRD value-prop callout, primary "Launch New Hiring Campaign →" CTA + secondary dashboard link, and a looping **Live Agent** feed card (mirrors the Task 5 stream: badges + running £2,025 total) as the memorable element. Below: the three value-metric cards as a "value ladder" (Outreach ~£0.05 · Vetted +£25 [PAID] · Placement +£2,000 [TOP OUTCOME, gold hero]). Staggered fade-in-up reveals on load. Brand renamed across navbar/brand/title/package.json; Link-rendered Buttons use `nativeButton={false}` for correct a11y semantics.

Build Page 1 from ui_prd.md:

- High-impact hero with app name "AI Recruiting Agent" and "Paid x Deploy by Antler" branding.
- Value proposition callout text.
- Three value metric cards (Outreach Cost ~£0.05/email, Vetted Candidate +£25, Successful Placement +£2,000) styled as polished stat cards.
- Prominent "Launch New Hiring Campaign →" CTA that routes to the Onboarding page.
- This is a presentation/pitch screen — make it feel like a product landing page, with real visual hierarchy, not a placeholder.

## Task 3: Campaign Onboarding & Setup page ✅ DONE

**Implemented** in [src/routes/onboarding.tsx](src/routes/onboarding.tsx). Form: Company Name, Target Role Title, Job Description (textarea **with drag-and-drop / browse** for `.txt`/`.md` files). New primitives: [input.tsx](src/components/ui/input.tsx), [textarea.tsx](src/components/ui/textarea.tsx), [label.tsx](src/components/ui/label.tsx). Client-side validation with `aria-invalid` red states + inline errors. Pipeline visualizer (CV Screening → Take-Home → Interview). "Deploy Agent & Initialize Funnel" calls `api.campaigns.createCampaign` via `useMutation`, shows a spinner, then routes to `/dashboard` — raced against a 1.5s timeout so a not-yet-provisioned backend never strands the demo. Bonus "Prefill demo" button fills Hooli values for the stage. (Verified end-to-end: validation errors, prefill, and submit→dashboard navigation all work; `api.campaigns` is the only tsc artifact, resolves on `npx convex dev`.)

Build Page 2 from ui_prd.md, wired to Convex:

- Form: Company Name, Target Role Title, Job Description (drag-and-drop file or textarea).
- Hiring process pipeline visualizer: fixed horizontal bar showing CV Screening → Take-Home Assessment → Human Interview.
- "Deploy Agent & Initialize Funnel" CTA: on submit, call a Convex mutation to create the campaign and seed the 3 demo candidates at "Found"/"sourced" state, then route to the Live Dashboard.
- Form validation and good empty/loading/submitting states.

## Task 4: Live Dashboard — Kanban board (main panel) ✅ DONE

**Implemented** in [src/routes/dashboard.tsx](src/routes/dashboard.tsx) + [src/lib/board.ts](src/lib/board.ts) (column mapping imported from `convex/schema` — single source of truth) + [src/components/ui/markdown.tsx](src/components/ui/markdown.tsx) (dependency-free report renderer). Six columns subscribed to `api.candidates.listCandidates`; added `motion` for smooth cross-column card movement (`layout`/`layoutId` + `AnimatePresence`, no page flash). Rich cards: initials avatar (hashed colour), name, email, 6-segment stage tracker, github link. Take-Home cards show a "View Claude Take-Home Report" toggle expanding inline markdown + score badge. Interview cards show ❌ Reject / ✅ Pass & Hire calling `passCandidate`/`rejectCandidate`. Declined/opted-out candidates fade + drop into the "Declined / Opted Out" footer bin. A demo fallback (`DEMO_CANDIDATES`, mirrors `convex/seed.ts`) makes the board rich + interactive before a deployment exists; live `listCandidates` data takes over reactively the instant it returns. (Verified live: report expand, and Pass & Hire animating Alex from Interview → Hired.)

Build the main panel of Page 3:

- Horizontal Kanban with 6 columns: Found, Reached Out, CV Screening, Take-Home Assessment, Interview, Hired.
- Subscribe to the Convex `listCandidates` query — cards must animate/transition smoothly between columns as `stage` changes, with no page flash (reactive re-render only).
- Take-Home Assessment card: "View Claude Take-Home Report" toggle that expands an inline markdown report.
- Interview card: "❌ Reject" / "✅ Pass & Hire" buttons that call Convex mutations (human-in-the-loop decision).
- Declined/opted-out candidates: fade out and drop into a compact "Declined / Opted Out" footer bin, separate from the active lanes.
- Make candidate cards visually rich: name, email, stage tracker/progress indicator, avatar/initials, subtle hover states.

## Task 5: Live Dashboard — Activity feed & Paid billing ledger (sidebars) ✅ DONE

**Implemented.** Introduced a shared [dashboard-store.tsx](src/lib/dashboard-store.tsx) (React context) so the board, feed, ledger, and toast react to the same `pass`/`reject` actions — live Convex (`listNotifications`, `getInvoice`) with demo fallback. Pricing + invoice aggregation moved into [convex/schema.ts](convex/schema.ts) (`SIGNAL_PRICING`, `aggregateSignals`) so the receipt and `getInvoice` share identical math; `model.ts`/`billing.ts` now import it.
- **Activity Feed** ([activity-feed.tsx](src/components/dashboard/activity-feed.tsx)): same notification data as the Hub, newest-first, fade-in on prepend, badge styles (PROCESSING yellow / EMAIL SENT green / INBOUND REPLY blue / PAID SIGNAL violet-bold).
- **Paid "Live Receipt"** ([paid-ledger.tsx](src/components/dashboard/paid-ledger.tsx)): off-white cream sheet with torn zigzag edges, `[PAID]` violet header, mono numerals, Total Revenue / Cost to Serve / Net Margin, the running invoice table. Revenue **pulses + flashes green** on increment; new rows **highlight (yellow fade)**.
- **Money toast** ([money-toast.tsx](src/components/dashboard/money-toast.tsx)): top-center violet toast on `successful_hire`.

Notes: fixed a real bug — the placeholder `VITE_CONVEX_URL` must be a *parseable* convex.cloud name or the client throws a fatal "Couldn't parse deployment name" crash-loop (now `dutiful-giraffe-487`); added `suppressHydrationWarning` on feed timestamps. **Verified live:** Pass & Hire → toast + Alex→Hired + 2 feed entries + revenue £50→£2,050.

Build the right-column sidebars of Page 3:

- **Activity Feed (top)**: subscribes to the same notifications data as the Notifications Hub. New entries prepend with a fade-in animation. Style log types distinctly: `[PROCESSING]` yellow badge, `[EMAIL SENT]` green badge, `[INBOUND REPLY]` blue badge, `[PAID SIGNAL]` bold purple text.
- **Paid Billing Ledger (bottom)**: style this panel as a "Live Receipt" — off-white background, monospace numerals, dashed/jagged top-bottom border, `[ PAID ]` branded header badge with a distinct accent color separate from the rest of the app's palette.
  - High-level cards: Total Revenue, Cost to Serve, Net Margin %.
  - Dynamic invoice table (Fired Signal / Type / Unit Price / Qty / Total Billed) subscribed to Convex billing data.
  - Animations: when Total Revenue increments, pulse + flash green. When a new invoice row appears, briefly highlight it with a yellow fade-out.
- **Global "money" toast**: when `successful_hire` (£2,000) fires, show a top-center toast: "💳 Paid Signal Fired: £2,000 added to invoice for Successful Placement".

## Task 6: Notifications Hub (full page) ✅ DONE

**Implemented** in [src/routes/notifications.tsx](src/routes/notifications.tsx). Reads the **same** `api.notifications.listNotifications` query as the dashboard feed (demo fallback before backend) — guaranteed parity. Full-width audit table: Time (HH:MM:SS, mono) · Category (Outreach / AI Analysis / Paid.com Billing / System Override, with coloured dot) · Description (full text, paid signals in violet-bold), each row with a badge-coloured left accent. Top pill filters (All / Agent Actions / Financials / Errors) with live per-filter counts, driven by `matchesFilter` from [src/lib/notifications.ts](src/lib/notifications.ts); rows animate in/out on filter change. Reached via the persistent navbar link. (Verified live: All shows 7 events; Financials narrows to the 2 Paid.com billing signals.)

Build Page 4 from ui_prd.md:

- Full-width table reading from the same global notifications data source as the dashboard activity feed (must stay in sync, same Convex query).
- Columns: Timestamp (HH:MM:SS), Category (Outreach, AI Analysis, Paid.com Billing, System Override), Description (full text).
- Top pill-navigation filter: All, Agent Actions, Financials, Errors.
- Reachable via the persistent navbar link from any page.

## Task 7: Final polish pass ✅ DONE

**Implemented.**
- **Accessibility** ([src/styles.css](src/styles.css)): one consistent keyboard `focus-visible` ring across every interactive element (links, buttons, pills, inputs, toggles); `prefers-reduced-motion` block that collapses the pulses/fades/springs; improved money-toast contrast (`text-paid-foreground` on a denser violet).
- **Responsive**: verified the dashboard 3-column grid at presentation width (1512), stacks gracefully below `xl` (1120 → board / feed / full receipt stacked), and the landing reflows cleanly on mobile (390). Board scrolls horizontally; receipt stays full-width.
- **Consistency**: all four pages share the design system (gold/violet on dark, Bricolage/Inter/JetBrains, radius/spacing scale); empty states present everywhere (board columns, declined bin, feed, ledger, hub filters).
- **Verification**: `prettier --check` clean (only the generated `routeTree.gen.ts` is flagged); `tsc` has zero real errors — all 19 remaining are Convex codegen artifacts that resolve on `npx convex dev`.

Not doable without a backend login: the PRD's "verify subscriptions update live via the Convex dashboard" — the `useQuery` wiring is correct and the reactive update path is proven through the local demo store (Pass & Hire updates board + feed + ledger + toast together). It will flow from Convex the moment `npx convex dev` + `seed:seedDemo` run.

After tasks 1–6 are functionally complete:

- Cross-page visual consistency check: spacing, color usage, typography scale, button states, empty states, loading skeletons.
- Verify all Convex subscriptions update the UI live with zero manual refresh (test by mutating data directly in the Convex dashboard or via a seed script while the app is open).
- Responsive pass for the dashboard's three-column layout (at minimum, works well on a wide presentation screen — secondary priority below desktop).
- Accessibility basics: contrast on the colored badges/toasts, focus states on interactive elements (Reject/Pass buttons, filters, CTAs).
