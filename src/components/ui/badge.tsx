import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        outline: "border-border text-muted-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        // Paid.com brand chip.
        paid: "border-paid/30 bg-paid/15 font-semibold tracking-wide text-paid",
        // ----- Activity-feed log badges (map to NotificationBadge) -----
        processing:
          "border-badge-processing/25 bg-badge-processing/12 text-badge-processing",
        email: "border-badge-email/25 bg-badge-email/12 text-badge-email",
        reply: "border-badge-reply/25 bg-badge-reply/12 text-badge-reply",
        signal:
          "border-badge-paid/30 bg-badge-paid/15 font-semibold text-badge-paid",
        info: "border-badge-info/20 bg-badge-info/10 text-badge-info",
        error: "border-badge-error/25 bg-badge-error/12 text-badge-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
