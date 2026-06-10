import { cn } from "@/lib/utils"

/**
 * The agent glyph: a gold rhombus with an inner spark. Used in the navbar and
 * the landing hero. Size is controlled by the wrapping element's font-size /
 * the `className` (defaults to a 9x9 box).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 items-center justify-center",
        className
      )}
      aria-hidden
    >
      <span className="absolute inset-0 rotate-45 rounded-[30%] bg-primary/15 ring-1 ring-primary/30" />
      <span className="absolute size-1.5 rotate-45 rounded-[2px] bg-primary shadow-[0_0_12px_2px] shadow-primary/60" />
    </span>
  )
}

/** Full brand lockup: glyph + wordmark + the Paid × Antler kicker. */
export function BrandLockup({
  className,
  showKicker = true,
}: {
  className?: string
  showKicker?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <div className="flex flex-col leading-none">
        <span className="font-heading text-base font-bold tracking-tight">
          Crackd
        </span>
        {showKicker && (
          <span className="text-[0.62rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Paid <span className="text-paid">×</span> Deploy by Antler
          </span>
        )}
      </div>
    </div>
  )
}
