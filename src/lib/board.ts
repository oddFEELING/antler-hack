import {
  PIPELINE_COLUMNS,
  DECLINED_STAGES,
  type CandidateStage,
  type PaidSignal,
} from "../../convex/schema"
import type { NotifItem } from "@/lib/notifications"

// Re-export so the dashboard imports board concepts from one place.
export { PIPELINE_COLUMNS }

/** Candidate shape the board renders. Live Convex docs are a superset. */
export type BoardCandidate = {
  _id: string
  name: string
  email: string
  stage: CandidateStage
  githubUrl?: string
  takeHomeReport?: string
  takeHomeScore?: number
}

const declined = new Set<string>(DECLINED_STAGES)
export function isDeclined(stage: CandidateStage): boolean {
  return declined.has(stage)
}

/** Index of the column a stage belongs to (0–5), or -1 if declined/unknown. */
export function columnIndexForStage(stage: CandidateStage): number {
  return PIPELINE_COLUMNS.findIndex((c) =>
    (c.stages as readonly string[]).includes(stage)
  )
}

/** Group active candidates by column id; declined go to their own bin. */
export function groupByColumn(candidates: BoardCandidate[]) {
  const byColumn: Record<string, BoardCandidate[]> = {}
  for (const col of PIPELINE_COLUMNS) byColumn[col.id] = []
  const declinedList: BoardCandidate[] = []

  for (const c of candidates) {
    if (isDeclined(c.stage)) {
      declinedList.push(c)
      continue
    }
    const col = PIPELINE_COLUMNS.find((c2) =>
      (c2.stages as readonly string[]).includes(c.stage)
    )
    if (col) byColumn[col.id].push(c)
  }
  return { byColumn, declinedList }
}

// -----------------------------------------------------------------------------
// Demo fallback — mirrors convex/seed.ts so the board is rich + interactive
// before a Convex deployment exists. Replaced by live data the instant the
// `listCandidates` subscription returns rows.
// -----------------------------------------------------------------------------

export const DEMO_CAMPAIGN = "Founding Backend Engineer @ Hooli"

const ALEX_REPORT = `## Take-Home Review — Alex Chen
**Verdict:** Pass · **Score:** 84 / 100

### Summary
Clean, well-structured submission. Built a rate-limited API gateway with a
token-bucket limiter backed by Redis. Idiomatic code, reviewable commit history.

### Strengths
- **Correct concurrency** — atomic Lua scripts in Redis, no read-then-write race.
- **Tests** — 87% coverage, including burst/refill edge cases.
- **Readability** — small functions, no dead code.

### Concerns
- Fails closed (not open) if Redis is unavailable.
- Limits are hard-coded; would want env-driven config for production.

### Recommendation
Strong hire signal on fundamentals. Advance to human interview.`

const JORDAN_REPORT = `## Take-Home Review — Jordan Blake
**Verdict:** Pass · **Score:** 76 / 100

### Summary
Solid event-driven ingestion service with a clean queue abstraction and sensible
back-pressure handling.

### Strengths
- **Pragmatic design** — clear module boundaries, easy to follow.
- **Observability** — structured logs and metrics from the start.

### Concerns
- Thinner test coverage (61%) around retry paths.
- Some duplicated serialization logic worth extracting.

### Recommendation
Above the bar. Worth a human interview.`

export const DEMO_CANDIDATES: BoardCandidate[] = [
  {
    _id: "demo-1",
    name: "Sofia Almeida",
    email: "sofia@example.com",
    stage: "sourced",
  },
  {
    _id: "demo-2",
    name: "Diego Fernandez",
    email: "diego@example.com",
    stage: "contacted",
  },
  {
    _id: "demo-3",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    stage: "cv_screened",
  },
  {
    _id: "demo-4",
    name: "Jordan Blake",
    email: "jordan.blake@example.com",
    stage: "vetted",
    githubUrl: "https://github.com/jordanblake/ingest-service",
    takeHomeReport: JORDAN_REPORT,
    takeHomeScore: 76,
  },
  {
    _id: "demo-5",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    stage: "in_interview",
    githubUrl: "https://github.com/alexchen/rate-limiter-gateway",
    takeHomeReport: ALEX_REPORT,
    takeHomeScore: 84,
  },
  {
    _id: "demo-6",
    name: "Marcus Boateng",
    email: "marcus.boateng@example.com",
    stage: "declined",
  },
]

/** Signals already fired in the demo fixture (drives the starting invoice). */
export const DEMO_SIGNALS: PaidSignal[] = [
  "outreach_sent",
  "outreach_sent",
  "outreach_sent",
  "submission_evaluated",
  "submission_evaluated",
  "candidate_vetted", // Jordan
  "candidate_vetted", // Alex
]

const now = Date.now()
const ago = (s: number) => now - s * 1000

/** Activity log for the demo, newest-first (matches the fixture above). */
export const DEMO_NOTIFICATIONS: NotifItem[] = [
  {
    _id: "n-1",
    _creationTime: ago(8),
    category: "paid_billing",
    badge: "paid_signal",
    description: "Fired signal 'candidate_vetted' (outcome, £25) to Paid.",
  },
  {
    _id: "n-2",
    _creationTime: ago(20),
    category: "ai_analysis",
    badge: "info",
    description:
      "Claude evaluated the repository provided by Alex Chen. Code quality rating scored 84/100.",
  },
  {
    _id: "n-3",
    _creationTime: ago(34),
    category: "outreach",
    badge: "inbound_reply",
    description:
      "Parsed reply from Alex Chen. Detected GitHub repo: github.com/alexchen/rate-limiter-gateway",
  },
  {
    _id: "n-4",
    _creationTime: ago(52),
    category: "outreach",
    badge: "email_sent",
    description: "Outreach delivered to alex.chen@example.com.",
  },
  {
    _id: "n-5",
    _creationTime: ago(58),
    category: "outreach",
    badge: "processing",
    description: "Drafting personalized outreach for Priya Nair...",
  },
  {
    _id: "n-6",
    _creationTime: ago(70),
    category: "paid_billing",
    badge: "paid_signal",
    description: "Fired signal 'outreach_sent' (usage) to Paid.",
  },
  {
    _id: "n-7",
    _creationTime: ago(96),
    category: "system",
    badge: "info",
    description:
      'Campaign initialized: Founding Backend Engineer at Hooli. 3 candidates ingested at "Found".',
  },
]
