import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { notificationBadge, notificationCategory } from "./schema"
import { logNotification } from "./model"

// =============================================================================
// NOTIFICATIONS (global activity log)
//
// Frontend contract — the dashboard Activity Feed AND the Notifications Hub
// both read from this one query, guaranteeing parity (PRD requirement):
//   listNotifications({ campaignId }) -> Doc<"notifications">[]  (newest first)
//   addNotification({...})            (agent / backend logging entry point)
//
// The pill filters in the Hub (All / Agent Actions / Financials / Errors) map
// onto the data like this — apply client-side, no extra query needed:
//   Agent Actions -> category in {"outreach","ai_analysis"}
//   Financials    -> category === "paid_billing"
//   Errors        -> badge === "error"
// =============================================================================

/** Newest-first activity log for a campaign. */
export const listNotifications = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<Doc<"notifications">[]> => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .take(200)
  },
})

/** Logging entry point for the agent / backend actions. */
export const addNotification = mutation({
  args: {
    campaignId: v.id("campaigns"),
    category: notificationCategory,
    badge: notificationBadge,
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await logNotification(ctx, args)
  },
})
