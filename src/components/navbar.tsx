import { Link } from "@tanstack/react-router"
import { LayoutDashboard, Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { BrandLockup } from "@/components/brand"

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const

/**
 * Persistent top navbar for the app surfaces (Dashboard, Notifications).
 *
 * `campaignName` is passed in rather than queried here so the shell renders
 * with or without a live Convex connection. Later tasks pass the value from
 * `api.campaigns.getActiveCampaign`.
 */
export function Navbar({ campaignName }: { campaignName?: string }) {
  return (
    <header className="sticky top-0 z-40">
      <div className="border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-5 sm:px-8">
          <Link to="/" className="shrink-0">
            <BrandLockup />
          </Link>

          {/* Active campaign context */}
          <div className="ml-2 hidden min-w-0 items-center gap-2 sm:flex">
            <span className="h-6 w-px bg-border" />
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-badge-email shadow-[0_0_8px_1px] shadow-badge-email/70" />
              <span className="truncate text-sm text-muted-foreground">
                Campaign:{" "}
                <span className="font-medium text-foreground">
                  {campaignName ?? "No active campaign"}
                </span>
              </span>
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className: cn(
                    "bg-accent text-foreground",
                    "ring-1 ring-border"
                  ),
                }}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* gold→violet hairline */}
      <div className="accent-rule h-px w-full opacity-60" />
    </header>
  )
}
