import { defineSchema, defineTable } from "convex/server"
import { type Infer, v } from "convex/values"

// =============================================================================
// SHARED VALIDATORS & TYPES  (single source of truth for the data contract)
//
// The frontend imports the TS types below so a query/mutation signature is the
// ONLY place a field name or enum value is defined. Backend + frontend stay in
// lockstep — change it here, both sides get the new type.
// =============================================================================

/**
 * Candidate lifecycle (authoritative — from prd.md).
 * The Kanban board (see PIPELINE_COLUMNS) is a presentation grouping of these.
 */
export const candidateStage = v.union(
  v.literal("sourced"), // imported, not yet contacted
  v.literal("contacted"), // agent sent outreach
  v.literal("accepted"), // candidate replied yes
  v.literal("declined"), // candidate opted out (terminal)
  v.literal("cv_screened"), // lightweight screen passed
  v.literal("vetted"), // take-home reviewed & passed (report available)
  v.literal("in_interview"), // handed to the hiring team (human decision)
  v.literal("hired"), // terminal success
  v.literal("not_hired") // hiring team rejected (terminal)
)
export type CandidateStage = Infer<typeof candidateStage>

/** Category shown in the Notifications Hub table. */
export const notificationCategory = v.union(
  v.literal("outreach"),
  v.literal("ai_analysis"),
  v.literal("paid_billing"),
  v.literal("system")
)
export type NotificationCategory = Infer<typeof notificationCategory>

/** Badge style for the dashboard Activity Feed (drives the colour/treatment). */
export const notificationBadge = v.union(
  v.literal("processing"), // yellow
  v.literal("email_sent"), // green
  v.literal("inbound_reply"), // blue
  v.literal("paid_signal"), // purple, bold
  v.literal("info"), // neutral
  v.literal("error") // red
)
export type NotificationBadge = Infer<typeof notificationBadge>

/** The four Paid.com signals the agent fires. */
export const paidSignal = v.union(
  v.literal("outreach_sent"),
  v.literal("submission_evaluated"),
  v.literal("candidate_vetted"),
  v.literal("successful_hire")
)
export type PaidSignal = Infer<typeof paidSignal>

export const billingType = v.union(v.literal("usage"), v.literal("outcome"))
export type BillingType = Infer<typeof billingType>

export const campaignStatus = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("completed")
)
export type CampaignStatus = Infer<typeof campaignStatus>

// =============================================================================
// PAID PRICING + INVOICE AGGREGATION
//
// One source of truth for what each signal bills (unitPrice) and costs us to
// serve (cost), both GBP. Shared by the backend (recordSignal / getInvoice) and
// the frontend "Live Receipt" panel, so the math can never drift between them.
// =============================================================================

export const SIGNAL_PRICING: Record<
  PaidSignal,
  { type: BillingType; unitPrice: number; cost: number }
> = {
  outreach_sent: { type: "usage", unitPrice: 0, cost: 0.05 },
  submission_evaluated: { type: "usage", unitPrice: 0, cost: 0 },
  candidate_vetted: { type: "outcome", unitPrice: 25, cost: 0 },
  successful_hire: { type: "outcome", unitPrice: 2000, cost: 0 },
}

/** Stable display order for invoice rows (matches the demo storyline). */
export const SIGNAL_ORDER: ReadonlyArray<PaidSignal> = [
  "outreach_sent",
  "submission_evaluated",
  "candidate_vetted",
  "successful_hire",
]

export type InvoiceRow = {
  signal: PaidSignal
  type: BillingType
  unitPrice: number // GBP per unit
  qty: number
  totalBilled: number // GBP (unitPrice * qty)
}
export type InvoiceSummary = {
  totalRevenue: number // GBP billed across all signals
  costToServe: number // GBP cost across all signals
  netMargin: number // percent, 0–100 (0 when there is no revenue yet)
}
export type Invoice = { rows: InvoiceRow[]; summary: InvoiceSummary }

/**
 * Aggregate a flat list of fired signals into the running invoice table + the
 * financial summary. Rows appear in SIGNAL_ORDER, and only once at least one of
 * that signal has fired, so the table fills in as the demo runs.
 */
export function aggregateSignals(signals: ReadonlyArray<PaidSignal>): Invoice {
  const counts = new Map<PaidSignal, number>()
  let totalRevenue = 0
  let costToServe = 0
  for (const s of signals) {
    counts.set(s, (counts.get(s) ?? 0) + 1)
    totalRevenue += SIGNAL_PRICING[s].unitPrice
    costToServe += SIGNAL_PRICING[s].cost
  }
  const rows: InvoiceRow[] = SIGNAL_ORDER.filter(
    (s) => (counts.get(s) ?? 0) > 0
  ).map((s) => {
    const qty = counts.get(s) ?? 0
    const p = SIGNAL_PRICING[s]
    return {
      signal: s,
      type: p.type,
      unitPrice: p.unitPrice,
      qty,
      totalBilled: p.unitPrice * qty,
    }
  })
  const netMargin =
    totalRevenue > 0
      ? Math.round(((totalRevenue - costToServe) / totalRevenue) * 100)
      : 0
  return { rows, summary: { totalRevenue, costToServe, netMargin } }
}

// =============================================================================
// KANBAN COLUMN MAPPING  (used by the Dashboard — Task 4)
//
// Each board column maps to one or more lifecycle stages. Stages in
// DECLINED_STAGES are pulled out of the active lanes into the "Declined /
// Opted Out" footer bin. Importing these constants keeps the board in sync
// with the schema instead of re-deriving the mapping in the component.
// =============================================================================

export const PIPELINE_COLUMNS = [
  { id: "found", label: "Found", stages: ["sourced"] },
  {
    id: "reached_out",
    label: "Reached Out",
    stages: ["contacted", "accepted"],
  },
  { id: "cv_screening", label: "CV Screening", stages: ["cv_screened"] },
  { id: "take_home", label: "Take-Home Assessment", stages: ["vetted"] },
  { id: "interview", label: "Interview", stages: ["in_interview"] },
  { id: "hired", label: "Hired", stages: ["hired"] },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  stages: ReadonlyArray<CandidateStage>
}>

export type PipelineColumnId = (typeof PIPELINE_COLUMNS)[number]["id"]

/** Stages that drop into the "Declined / Opted Out" bin instead of a column. */
export const DECLINED_STAGES = ["declined", "not_hired"] as const

// =============================================================================
// SCHEMA
// =============================================================================

export default defineSchema({
  // One hiring campaign = one role at one company. The demo runs a single
  // campaign at a time, but the schema supports many.
  campaigns: defineTable({
    companyName: v.string(),
    roleTitle: v.string(),
    jobDescription: v.string(),
    status: campaignStatus,
  }),

  // The candidate pipeline. The dashboard subscribes to this table and renders
  // each stage transition live.
  candidates: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    email: v.string(),
    stage: candidateStage,
    // Populated once the candidate replies / submits their take-home.
    githubUrl: v.optional(v.string()),
    takeHomeReport: v.optional(v.string()), // markdown — Claude's code critique
    takeHomeScore: v.optional(v.number()), // 0–100
    // Stable position within a column so cards don't reshuffle on re-render.
    order: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_and_stage", ["campaignId", "stage"]),

  // Global reactive activity log. Both the dashboard Activity Feed and the
  // Notifications Hub read from this same table (PRD requires parity).
  notifications: defineTable({
    campaignId: v.id("campaigns"),
    category: notificationCategory,
    badge: notificationBadge,
    description: v.string(),
  }).index("by_campaign", ["campaignId"]),

  // One row per Paid signal fired. The invoice view (getInvoice) aggregates
  // these by signal into the running invoice table + financial summary.
  // `unitPrice` is revenue billed to the customer; `cost` is our cost-to-serve.
  billingEvents: defineTable({
    campaignId: v.id("campaigns"),
    signal: paidSignal,
    type: billingType,
    unitPrice: v.number(), // GBP charged to the customer, per unit
    cost: v.number(), // GBP cost-to-serve, per unit (for margin tracing)
    candidateId: v.optional(v.id("candidates")),
  }).index("by_campaign", ["campaignId"]),
})
