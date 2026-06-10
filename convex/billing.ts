import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { type Invoice, aggregateSignals, paidSignal } from "./schema"
import { recordSignal } from "./model"

// =============================================================================
// PAID.COM BILLING LEDGER
//
// Frontend contract — everything the "Live Receipt" panel (Task 5) needs in
// one shape:
//   getInvoice({ campaignId }) -> {
//     rows: InvoiceRow[]          // one aggregated row per signal fired
//     summary: { totalRevenue, costToServe, netMargin }  // GBP, netMargin 0–100
//   }
//   fireSignal({ campaignId, signal, candidateId? })   // agent / demo trigger
//
// Invoice types + the aggregation live in schema.ts so the receipt panel and
// this query produce identical math.
// =============================================================================

export const getInvoice = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<Invoice> => {
    const events = await ctx.db
      .query("billingEvents")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .take(1000)
    return aggregateSignals(events.map((e) => e.signal))
  },
})

/** Fire a Paid signal (agent / scripted demo). Updates the ledger + feed. */
export const fireSignal = mutation({
  args: {
    campaignId: v.id("campaigns"),
    signal: paidSignal,
    candidateId: v.optional(v.id("candidates")),
  },
  handler: async (ctx, args) => {
    await recordSignal(ctx, args)
  },
})
