import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { logNotification } from "./model"

// =============================================================================
// CAMPAIGNS
//
// Frontend contract:
//   getActiveCampaign() -> Doc<"campaigns"> | null   (Dashboard / navbar)
//   getCampaign({ campaignId }) -> Doc<"campaigns"> | null
//   createCampaign({...}) -> Id<"campaigns">         (Onboarding — Task 3)
// =============================================================================

/** The most recently created campaign, or null if none exists yet. */
export const getActiveCampaign = query({
  args: {},
  handler: async (ctx): Promise<Doc<"campaigns"> | null> => {
    return await ctx.db.query("campaigns").order("desc").first()
  },
})

export const getCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<Doc<"campaigns"> | null> => {
    return await ctx.db.get(args.campaignId)
  },
})

/**
 * Onboarding submit handler. Creates the campaign and seeds the three demo
 * candidates at `sourced` (the "Found" column), then returns the new id so the
 * UI can route straight to /dashboard. Names/emails are placeholders the demo
 * can edit; the real flow advances them from here.
 */
export const createCampaign = mutation({
  args: {
    companyName: v.string(),
    roleTitle: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const campaignId = await ctx.db.insert("campaigns", {
      ...args,
      status: "active",
    })

    const seedCandidates = [
      { name: "Alex Chen", email: "alex.chen@example.com" },
      { name: "Priya Nair", email: "priya.nair@example.com" },
      { name: "Marcus Boateng", email: "marcus.boateng@example.com" },
    ]
    await Promise.all(
      seedCandidates.map((c, i) =>
        ctx.db.insert("candidates", {
          campaignId,
          name: c.name,
          email: c.email,
          stage: "sourced",
          order: i,
        })
      )
    )

    await logNotification(ctx, {
      campaignId,
      category: "system",
      badge: "info",
      description: `Campaign initialized: ${args.roleTitle} at ${args.companyName}. 3 candidates ingested at "Found".`,
    })

    return campaignId
  },
})
