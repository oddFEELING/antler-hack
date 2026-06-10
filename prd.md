# AI Recruiting Agent: PRD (Paid x Deploy by Antler)

## One-liner

An AI agent that sources strong engineers, runs outreach, screens them, and issues plus reviews a take-home, then hands a vetted shortlist to the hiring team. It charges only for value delivered using Paid: a small fee per vetted candidate and a large fee per successful hire.

## Goal of this build

Ship a working end-to-end demo for the Agentic AI track. Winning the track requires three things, and the demo must show all three live:

1. An AI agent that takes actions and makes decisions with some autonomy.
2. A product set up in Paid with pricing attached.
3. Usage signals fired by the agent and attributed to a real order in Paid.

Everything in scope below exists to prove those three points on stage. Nothing else.

## What we are demoing

A single open role at one fictional hiring company. Three candidates enter the funnel. Two decline, one accepts (the presenter). The accepting candidate is screened, completes a take-home, gets reviewed, and is then advanced to a human interview. The hiring team marks the result, and Paid bills the placement.

## Where the agent actually is (read this first)

Most of the funnel is faked or scripted for demo stability (see below). That is fine, but it means the autonomous part of the product must be visible and real in one place: the email orchestration. The agent drafts a personalised email with Claude, sends it, watches for the reply, parses the public GitHub link out of it, and advances the candidate on its own. That loop is what makes this an agent rather than a scripted UI, so it must run live and the email drafting must be a real Claude call, not a template.

## Real vs faked

Keep the live surface small so the demo cannot stall.

Real and live:

- Outreach email drafted by Claude (personalised per candidate) and sent by the agent.
- Candidate reply handling: receive the reply, parse the GitHub link, advance state.
- Take-home email with today's deadline and a request for a public GitHub link.
- Paid signals firing and the invoice updating on the order.

Faked or scripted (acceptable for a hackathon, state it openly):

- Sourcing. Upload a CSV of three candidates (name, email) instead of crawling olympiad, hackathon, and GitHub sources.
- The two declines and one accept are scripted for a clean demo.
- CV screening is a lightweight status flip, not a real call.
- Take-home review. The report and pass or fail verdict are pre-set for the demo rather than generated live. See the risk note below.

## Demo integrity risk (faked review)

Faking the take-home review is the safe choice for stability and the risky choice for the judging, because it removes the most convincing "the AI made a judgment" beat. Two ways to mitigate:

- Preferred: keep the review as a single real Claude call against a repo you control and have tested, with a hardcoded fallback if the API errors. You then truthfully say "the agent reviewed it" with no risk of a hang.
- If fully faked: lean the pitch on the autonomous email loop and the Paid monetisation as the agentic story, and make sure the email drafting is genuinely LLM-generated so there is visible live AI on screen.

## Screens

Two screens only.

### 1. Setup (company onboarding)

- Role title.
- Job description (paste or upload).
- Hiring process, fixed for the demo: CV screening, take-home assessment, human interview.
- A launch action that moves to the dashboard.

### 2. Dashboard

- Stat tiles: sourced, contacted, vetted, hired.
- Candidate list. Each row shows name, email, current stage, and a stage tracker.
- Activity feed that updates as the agent acts (emails sent, replies, review complete).
- Paid panel showing signals fired, the running invoice on the order, and cost to serve.
- The accepting candidate shows a "view take-home report" toggle once vetted, and a company decision (passed or rejected) at the interview stage.

The dashboard must visibly change as the backend does its work. State transitions are the demo.

## Candidate lifecycle

States: sourced, contacted, declined, accepted, cv_screened, vetted, in_interview, hired, not_hired.

Flow for the accepting candidate: sourced, contacted, accepted, cv_screened, vetted, in_interview, hired.

Decisions and who makes them:

- Accept or decline: candidate. Declines exit the funnel and cost nothing.
- Meets the bar after take-home: pre-set for the demo (real Claude call optional, see risk note). Failing exits and costs nothing.
- Final hire: hiring team (human in the loop). This is the only human decision.

## Paid integration

This is the money loop and the part judges grade most closely.

Setup, once per role:

- Create a product in Paid ("Recruiting Agent") with pricing attached.
- Open an order for the role. Customer is the hiring company. Every signal below attributes to this order.

Signals fired by the agent:

- `outreach_sent`: usage signal, fired per outreach email. Carries cost for margin tracing.
- `submission_evaluated`: usage signal, fired when the take-home is processed. Carries cost.
- `candidate_vetted`: outcome signal, fired when a candidate passes the screen. Charge GBP 25.
- `successful_hire`: outcome signal, fired when the hiring team marks the interview passed. Charge GBP 2,000.

Pricing logic:

- Two charge points only. Vetted is small, hire is large.
- The small vetted fee keeps every screen margin-positive. The large hire fee aligns the agent toward placements, not toward flooding the client with marginal candidates.
- Hire is a flat GBP 2,000 for the demo. A percentage of first-year salary is a config swap, not a code change, and can be mentioned verbally.

Outcome on the dashboard: one invoice per order, for example 1 vetted at GBP 25 plus 1 hire at GBP 2,000 equals GBP 2,025, with cost to serve shown underneath to prove margin.

## Tech stack

Built on the chowbea/loyalty stack (TanStack Start + Convex). Chosen for a reactive, demo-friendly UI where the dashboard updates live as the agent acts, plus clean screen-sharing.

- TanStack Start + React 19 + Vite + TypeScript, single app with file-based routing. Hosts the Setup and Dashboard screens.
- Convex for the backend: database, server functions, scheduled functions, and HTTP endpoints. The candidate pipeline lives here and the frontend subscribes to it, so dashboard state transitions render live with no polling.
- Convex actions (Node runtime) host the external integrations:
  - Claude API for drafting the personalised outreach emails (real LLM call), and optionally the take-home review (real call with a hardcoded fallback).
  - Gmail API through a dedicated demo Gmail account that acts as the agent sender; used to send emails and read replies.
  - Paid SDK for the money loop: product/order setup and firing usage plus outcome signals.
  - GitHub API only if the review is kept real (fetch a few key files from the public repo). Not needed if the review is faked.
- shadcn/ui + Tailwind CSS v4 for components and styling.
- Convex Cloud deployment: dutiful-giraffe-487.

Email reliability requirement: include a manual "sync inbox" action (a Convex action that polls Gmail) so a slow candidate reply never strands the demo, with a fallback field to paste the repo link directly.

## Build order

Build so there is always something demo-able, with the live agentic loop first.

1. Database, CSV intake, and the dashboard table. A visible pipeline even if nothing else works.
2. Email orchestration: draft with Claude, send, receive the reply, parse the GitHub link, advance the candidate. This is now the agentic core and the most fragile part, so prove it early.
3. Outreach send plus Paid signal wiring.
4. The take-home report (pre-set, or a real Claude call with a hardcoded fallback) and the report display.
5. The Paid invoice view and the final hire charge.

If the email loop fails on stage, a working dashboard plus live Paid signals on an order is still a partial entry, but the email loop is the agent, so it is the priority.

## Demo script (on stage)

1. Open Setup. Show the role, paste the job description, point at the three process steps. Launch.
2. On the dashboard, three candidates sit at sourced.
3. Trigger outreach. The agent drafts and sends three emails. `outreach_sent` signals appear in the Paid panel.
4. Two decline, one accepts. The feed reflects each. Declines cost nothing.
5. CV screening flips the accepting candidate to screened.
6. Take-home is issued (due today). The candidate replies with a public GitHub link, the agent parses it, and the report appears. The candidate moves to vetted. `submission_evaluated` and `candidate_vetted` (GBP 25) hit the order.
7. The hiring team clicks passed. The candidate moves to hired. `successful_hire` (GBP 2,000) hits the order.
8. Close on the Paid invoice for the order, with margin shown. One line: "the agent ran the outreach and screening loop autonomously, and we only charge for value delivered, so this invoice is proof of work."

## Success criteria

- The agent autonomously drafts and sends emails, handles the reply, parses the link, and advances the candidate without manual steps.
- A product with pricing exists in Paid.
- At least one usage signal and the two outcome charges land on a single order during the demo.
- The dashboard updates visibly as the backend acts.

## Out of scope

- Real sourcing and crawling.
- Multiple roles, multiple companies, auth, and user accounts.
- Scheduling or running the actual human interview.
- Payment collection. Paid generates the invoice; settlement is not demoed.
- Percentage-of-salary billing logic (mentioned verbally, not built).

## Open questions to settle before building

- Take-home review: pre-set, or a real Claude call with a fallback? A real call with a cached or hardcoded fallback is recommended because it keeps the AI judgment credible at near-zero risk.
- CV screening: confirmed as a status flip to avoid an extra live AI call.
- `successful_hire` timing: in the real product this fires days later by webhook. In the demo it fires inline when the hiring team clicks passed. Say this out loud.
