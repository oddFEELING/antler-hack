import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"

/**
 * Layout wrapper for the in-app surfaces (Dashboard, Notifications): persistent
 * navbar + a width-constrained content area. Pre-launch screens (Home,
 * Onboarding) render their own full-bleed layouts and don't use this.
 *
 * `bleed` lets the Dashboard use the full viewport width for its 3-column grid.
 */
export function AppShell({
  children,
  campaignName,
  bleed = false,
}: {
  children: React.ReactNode
  campaignName?: string
  bleed?: boolean
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar campaignName={campaignName} />
      <main
        className={cn(
          "mx-auto w-full flex-1 px-5 py-8 sm:px-8",
          bleed ? "max-w-[1600px]" : "max-w-6xl"
        )}
      >
        {children}
      </main>
    </div>
  )
}

/** Small labelled section heading used across app pages. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
