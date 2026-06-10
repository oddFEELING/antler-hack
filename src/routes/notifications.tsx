import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { AnimatePresence, motion } from "motion/react"

import { api } from "../../convex/_generated/api"
import { DEMO_CAMPAIGN, DEMO_NOTIFICATIONS } from "@/lib/board"
import {
  BADGE_META,
  CATEGORY_LABEL,
  type NotifItem,
  formatTime,
  matchesFilter,
} from "@/lib/notifications"
import { AppShell, SectionHeading } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/notifications")({
  component: Notifications,
})

// Filter pills (PRD). Mapping to category/badge lives in matchesFilter().
const filters = ["All", "Agent Actions", "Financials", "Errors"] as const

// Coloured left-accent + dot per badge, keyed to the feed's palette.
const ACCENT: Record<string, string> = {
  processing: "bg-badge-processing",
  email: "bg-badge-email",
  reply: "bg-badge-reply",
  signal: "bg-badge-paid",
  info: "bg-badge-info",
  error: "bg-badge-error",
}

function Notifications() {
  const campaign = useQuery(api.campaigns.getActiveCampaign)
  const live = useQuery(
    api.notifications.listNotifications,
    campaign?._id ? { campaignId: campaign._id } : "skip"
  )
  // Same data source as the dashboard feed; demo fallback before a backend.
  const notifications: NotifItem[] =
    Array.isArray(live) && live.length > 0 ? live : DEMO_NOTIFICATIONS
  const campaignName = campaign
    ? `${campaign.roleTitle} @ ${campaign.companyName}`
    : DEMO_CAMPAIGN

  const [filter, setFilter] = useState<string>("All")
  const rows = notifications.filter((n) => matchesFilter(n, filter))

  return (
    <AppShell campaignName={campaignName}>
      <SectionHeading
        eyebrow="Audit Log"
        title="Notifications Hub"
        description="An exhaustive, real-time log of every agent action, AI analysis, and Paid.com billing signal across the campaign."
      />

      {/* filter pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const active = f === filter
          const count = notifications.filter((n) => matchesFilter(n, f)).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {f}
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[0.65rem]",
                  active ? "bg-primary/20" : "bg-muted/70"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <span className="size-1.5 animate-pulse rounded-full bg-badge-email" />
          live
        </span>
      </div>

      {/* audit table */}
      <div className="overflow-hidden rounded-xl border bg-card/50">
        <div className="grid grid-cols-[96px_180px_1fr] gap-3 border-b border-border/70 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <span>Time</span>
          <span>Category</span>
          <span>Description</span>
        </div>

        <div className="divide-y divide-border/50">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((n) => {
              const meta = BADGE_META[n.badge]
              const isSignal = n.badge === "paid_signal"
              return (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative grid grid-cols-[96px_180px_1fr] items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  {/* left accent */}
                  <span
                    className={cn(
                      "absolute top-0 bottom-0 left-0 w-0.5 opacity-70",
                      ACCENT[meta.variant] ?? "bg-border"
                    )}
                  />
                  <span
                    suppressHydrationWarning
                    className="pt-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {formatTime(n._creationTime)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        ACCENT[meta.variant] ?? "bg-border"
                      )}
                    />
                    <span className="truncate text-xs text-foreground/90">
                      {CATEGORY_LABEL[n.category]}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Badge variant={meta.variant} className="mt-px shrink-0">
                      {meta.label}
                    </Badge>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isSignal
                          ? "font-semibold text-badge-paid"
                          : "text-foreground/80"
                      )}
                    >
                      {n.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {rows.length === 0 && (
            <div className="flex min-h-48 items-center justify-center p-8 text-sm text-muted-foreground/50">
              No {filter === "All" ? "" : `“${filter}”`} events logged yet.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
