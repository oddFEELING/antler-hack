import { mutation } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { logNotification, recordSignal } from "./model"

// =============================================================================
// DEV SEED
//
// `seedDemo` builds ONE fully-populated campaign so the frontend can be built
// against real, reactive data immediately — no mocked JSON in components.
// Run it from the Convex dashboard (Functions tab) or:  npx convex run seed:seedDemo
//
// The fixture deliberately exercises every UI surface:
//   - CV Screening column           (Priya)
//   - Take-Home column + report     (Alex, has markdown report + score)
//   - Declined / Opted Out bin       (Marcus)
//   - Activity feed: one of every badge type
//   - Paid ledger: outreach + submission_evaluated + candidate_vetted rows
//
// What's intentionally NOT seeded: `successful_hire`. Click "✅ Pass & Hire"
// on Alex (Interview) live to watch the £2,000 row, pulse + toast fire — the
// best way to test the reactive money loop.
//
// `resetDemo` wipes all data so you can re-seed cleanly.
// =============================================================================

const ALEX_REPORT = `## Take-Home Review — Alex Chen

**Verdict:** Pass · **Score:** 84 / 100

### Summary
Clean, well-structured submission. The candidate built a small rate-limited API
gateway with a token-bucket limiter and a Redis-backed store. Code is idiomatic
and the commit history shows incremental, reviewable progress.

### Strengths
- **Correct concurrency handling** — the limiter uses atomic Lua scripts in
  Redis rather than a read-then-write race.
- **Tests** — 87% coverage, including the tricky burst/refill edge cases.
- **Readability** — small functions, descriptive names, no dead code.

### Concerns
- No graceful degradation if Redis is unavailable (fails closed, not open).
- Config is hard-coded; would want env-driven limits for production.

### Recommendation
Strong hire signal on engineering fundamentals. Advance to human interview.`

export const seedDemo = mutation({
  args: {},
  handler: async (ctx): Promise<Id<"campaigns">> => {
    const campaignId = await ctx.db.insert("campaigns", {
      companyName: "Hooli",
      roleTitle: "Founding Backend Engineer",
      jobDescription:
        "We're hiring a founding backend engineer to own our core API and data " +
        "platform. You'll design services from scratch, set the engineering bar, " +
        "and work directly with the founders. Strong systems fundamentals, a bias " +
        "for shipping, and excellent code taste required.",
      status: "active",
    })

    // --- Candidates, placed to cover distinct board columns + the bin ---
    const alex = await ctx.db.insert("candidates", {
      campaignId,
      name: "Alex Chen",
      email: "alex.chen@example.com",
      stage: "in_interview", // Interview column → Pass/Reject buttons
      githubUrl: "https://github.com/alexchen/rate-limiter-gateway",
      takeHomeReport: ALEX_REPORT,
      takeHomeScore: 84,
      order: 0,
    })
    await ctx.db.insert("candidates", {
      campaignId,
      name: "Priya Nair",
      email: "priya.nair@example.com",
      stage: "cv_screened", // CV Screening column
      order: 1,
    })
    await ctx.db.insert("candidates", {
      campaignId,
      name: "Marcus Boateng",
      email: "marcus.boateng@example.com",
      stage: "declined", // Declined / Opted Out bin
      order: 2,
    })

    // --- Activity feed: one entry of each badge type, oldest first ---
    await logNotification(ctx, {
      campaignId,
      category: "system",
      badge: "info",
      description:
        'Campaign initialized: Founding Backend Engineer at Hooli. 3 candidates ingested at "Found".',
    })
    await logNotification(ctx, {
      campaignId,
      category: "outreach",
      badge: "processing",
      description: "Drafting personalized outreach for Alex Chen...",
    })
    await logNotification(ctx, {
      campaignId,
      category: "outreach",
      badge: "email_sent",
      description: "Outreach delivered to alex.chen@example.com.",
    })
    await logNotification(ctx, {
      campaignId,
      category: "outreach",
      badge: "inbound_reply",
      description:
        "Parsed reply from Alex Chen. Detected GitHub repo: github.com/alexchen/rate-limiter-gateway",
    })
    await logNotification(ctx, {
      campaignId,
      category: "ai_analysis",
      badge: "info",
      description:
        "Claude evaluated the repository provided by Alex Chen. Code quality rating scored 84/100.",
    })

    // --- Paid ledger: 3 outreach + 1 evaluation + 1 vetted (Alex) ---
    // recordSignal also logs a matching paid_billing notification each time.
    await recordSignal(ctx, { campaignId, signal: "outreach_sent" })
    await recordSignal(ctx, { campaignId, signal: "outreach_sent" })
    await recordSignal(ctx, { campaignId, signal: "outreach_sent" })
    await recordSignal(ctx, {
      campaignId,
      signal: "submission_evaluated",
      candidateId: alex,
    })
    await recordSignal(ctx, {
      campaignId,
      signal: "candidate_vetted",
      candidateId: alex,
    })

    return campaignId
  },
})

/** Wipe every table. Use before re-seeding. */
export const resetDemo = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of [
      "billingEvents",
      "notifications",
      "candidates",
      "campaigns",
    ] as const) {
      // Small demo tables — drain in one pass.
      const rows = await ctx.db.query(table).take(1000)
      await Promise.all(rows.map((r) => ctx.db.delete(r._id)))
    }
  },
})
