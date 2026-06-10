import type {
  NotificationBadge,
  NotificationCategory,
} from "../../convex/schema"
import type { badgeVariants } from "@/components/ui/badge"
import type { VariantProps } from "class-variance-authority"

export type NotifItem = {
  _id: string
  _creationTime: number
  category: NotificationCategory
  badge: NotificationBadge
  description: string
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

/** Maps a notification badge to its Badge variant + the bracketed feed label. */
export const BADGE_META: Record<
  NotificationBadge,
  { variant: BadgeVariant; label: string }
> = {
  processing: { variant: "processing", label: "PROCESSING" },
  email_sent: { variant: "email", label: "EMAIL SENT" },
  inbound_reply: { variant: "reply", label: "INBOUND REPLY" },
  paid_signal: { variant: "signal", label: "PAID SIGNAL" },
  info: { variant: "info", label: "INFO" },
  error: { variant: "error", label: "ERROR" },
}

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  outreach: "Outreach",
  ai_analysis: "AI Analysis",
  paid_billing: "Paid.com Billing",
  system: "System Override",
}

/** Filter pills in the Notifications Hub → which categories/badges they match. */
export function matchesFilter(n: NotifItem, filter: string): boolean {
  switch (filter) {
    case "Agent Actions":
      return n.category === "outreach" || n.category === "ai_analysis"
    case "Financials":
      return n.category === "paid_billing"
    case "Errors":
      return n.badge === "error"
    default:
      return true // "All"
  }
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-GB", { hour12: false })
}
