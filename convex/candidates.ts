import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { candidateStage } from "./schema"
import { logNotification, recordSignal } from "./model"

// =============================================================================
// CANDIDATES
//
// Frontend contract:
//   listCandidates({ campaignId }) -> Doc<"candidates">[]   (Kanban — Task 4)
//   setStage({ candidateId, stage })                        (generic move)
//   passCandidate({ candidateId })                          (✅ Pass & Hire)
//   rejectCandidate({ candidateId })                        (❌ Reject)
//
// The two decision mutations are the human-in-the-loop interview buttons. They
// update Convex (which drives the live board, ledger and feed). The real Paid
// SDK call is left to a Convex action — see recordSignal in model.ts.
// =============================================================================

/** All candidates for a campaign, ordered for stable column placement. */
export const listCandidates = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<Doc<"candidates">[]> => {
    const candidates = await ctx.db
      .query("candidates")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .take(200)
    return candidates.sort((a, b) => a.order - b.order)
  },
})

/** Generic stage move (used by the agent / scripted demo transitions). */
export const setStage = mutation({
  args: { candidateId: v.id("candidates"), stage: candidateStage },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.candidateId, { stage: args.stage })
  },
})

/**
 * Human-in-the-loop: hiring team passes the candidate. Moves them to `hired`
 * and fires the `successful_hire` (£2,000) outcome signal.
 */
export const passCandidate = mutation({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId)
    if (!candidate) throw new Error("Candidate not found")

    await ctx.db.patch(args.candidateId, { stage: "hired" })
    await logNotification(ctx, {
      campaignId: candidate.campaignId,
      category: "system",
      badge: "info",
      description: `Hiring team passed ${candidate.name}. Advancing to Hired.`,
    })
    await recordSignal(ctx, {
      campaignId: candidate.campaignId,
      signal: "successful_hire",
      candidateId: args.candidateId,
    })
  },
})

/** Human-in-the-loop: hiring team rejects. Moves to `not_hired` (Declined bin). */
export const rejectCandidate = mutation({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId)
    if (!candidate) throw new Error("Candidate not found")

    await ctx.db.patch(args.candidateId, { stage: "not_hired" })
    await logNotification(ctx, {
      campaignId: candidate.campaignId,
      category: "system",
      badge: "info",
      description: `Hiring team rejected ${candidate.name}.`,
    })
  },
})
