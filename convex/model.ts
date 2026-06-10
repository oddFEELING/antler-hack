import type { MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import type {
  NotificationBadge,
  NotificationCategory,
  PaidSignal,
} from "./schema"
import { SIGNAL_PRICING } from "./schema"

// =============================================================================
// Shared, non-registered helpers.
//
// These are plain async functions (NOT Convex functions) so callers invoke
// them directly inside a single transaction — avoiding the ctx.runMutation
// round-trips and race conditions the Convex guidelines warn about.
// Pricing lives in schema.ts so the frontend receipt and the backend agree.
// =============================================================================

/** Append an entry to the global activity log. */
export async function logNotification(
  ctx: MutationCtx,
  args: {
    campaignId: Id<"campaigns">
    category: NotificationCategory
    badge: NotificationBadge
    description: string
  }
): Promise<Id<"notifications">> {
  return await ctx.db.insert("notifications", args)
}

/**
 * Record a fired Paid signal: writes the billing event AND logs a matching
 * `paid_billing` notification so the ledger and the activity feed stay in sync.
 *
 * NOTE: this only updates Convex (which drives the live UI). The actual Paid
 * SDK call belongs in a Convex action — schedule it from the same mutation that
 * calls this helper so the local ledger and the real Paid order agree.
 */
export async function recordSignal(
  ctx: MutationCtx,
  args: {
    campaignId: Id<"campaigns">
    signal: PaidSignal
    candidateId?: Id<"candidates">
  }
): Promise<void> {
  const pricing = SIGNAL_PRICING[args.signal]

  await ctx.db.insert("billingEvents", {
    campaignId: args.campaignId,
    signal: args.signal,
    type: pricing.type,
    unitPrice: pricing.unitPrice,
    cost: pricing.cost,
    candidateId: args.candidateId,
  })

  const amount =
    pricing.unitPrice > 0
      ? `£${pricing.unitPrice.toLocaleString("en-GB")}`
      : "usage"
  await logNotification(ctx, {
    campaignId: args.campaignId,
    category: "paid_billing",
    badge: "paid_signal",
    description: `Fired signal '${args.signal}' (${pricing.type}, ${amount}) to Paid.`,
  })
}
