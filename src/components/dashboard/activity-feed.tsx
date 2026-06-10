import { Activity } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { useDashboard } from "@/lib/dashboard-store"
import { BADGE_META, formatTime } from "@/lib/notifications"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Dashboard Activity Feed — the agent's live "thinking stream". Reads the same
 * notifications the Notifications Hub uses. New entries prepend with a fade-in.
 */
export function ActivityFeed() {
  const { notifications } = useDashboard()

  return (
    <div className="flex max-h-[340px] flex-col overflow-hidden rounded-xl border bg-card/50">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <Activity className="size-4 text-muted-foreground" />
        <span className="font-heading text-sm font-semibold">
          Activity Feed
        </span>
        <span className="ml-auto size-1.5 animate-pulse rounded-full bg-badge-email shadow-[0_0_8px_1px] shadow-badge-email/70" />
      </div>

      <div className="flex scrollbar-thin flex-col gap-2 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {notifications.map((n) => {
            const meta = BADGE_META[n.badge]
            const isSignal = n.badge === "paid_signal"
            return (
              <motion.div
                key={n._id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border/60 bg-background/40 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span
                    suppressHydrationWarning
                    className="font-mono text-[0.65rem] text-muted-foreground/60"
                  >
                    {formatTime(n._creationTime)}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-1.5 text-xs leading-relaxed",
                    isSignal
                      ? "font-semibold text-badge-paid"
                      : "text-muted-foreground"
                  )}
                >
                  {n.description}
                </p>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {notifications.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground/40">
            Waiting for the agent to act…
          </div>
        )}
      </div>
    </div>
  )
}
