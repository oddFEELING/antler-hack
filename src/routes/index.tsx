import { useEffect, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Mail, ShieldCheck, Trophy, Radio } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BrandMark } from "@/components/brand"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({ component: Home })

// =============================================================================
// LANDING (Page 1) — the pitch screen that sets up the demo narrative.
// =============================================================================

function Home() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <TopBar />

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 sm:px-10">
        {/* ------------------------------ HERO ------------------------------ */}
        <section className="grid items-center gap-12 pt-10 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-24">
          <div>
            <div className="mb-7 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-border bg-card/50 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-badge-email shadow-[0_0_8px_1px] shadow-badge-email/70" />
              Autonomous hiring agent
            </div>

            <h1
              className="animate-fade-in-up font-heading text-5xl leading-[0.92] font-semibold tracking-tight text-balance sm:text-6xl xl:text-[4.5rem]"
              style={{ animationDelay: "60ms" }}
            >
              Hire the{" "}
              <span className="relative whitespace-nowrap text-primary">
                cracked
                <Underline />
              </span>{" "}
              engineers.
              <br />
              Pay only for outcomes.
            </h1>

            <p
              className="mt-7 max-w-xl animate-fade-in-up text-base leading-relaxed text-balance text-muted-foreground sm:text-lg"
              style={{ animationDelay: "140ms" }}
            >
              Crackd is an autonomous AI agent that sources, screens, and vets
              engineering talent — charging purely for value delivered via{" "}
              <span className="font-semibold text-paid">Paid.com</span>.
            </p>

            <div
              className="mt-9 flex animate-fade-in-up flex-wrap items-center gap-3"
              style={{ animationDelay: "220ms" }}
            >
              <Button
                size="lg"
                nativeButton={false}
                render={<Link to="/onboarding" />}
                className="group h-12 px-6 text-base shadow-lg shadow-primary/25"
              >
                Launch New Hiring Campaign
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<Link to="/dashboard" />}
                className="h-12 px-5 text-base"
              >
                See the live dashboard
              </Button>
            </div>
          </div>

          {/* live agent stream — the reactive money loop, on screen */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <LiveAgentFeed />
          </div>
        </section>

        {/* -------------------------- VALUE LADDER -------------------------- */}
        <section className="pb-24">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              The economics
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              Charge only for value delivered
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={<Mail className="size-4" />}
              label="Outreach Cost"
              value="~£0.05"
              unit="/ email"
              note="What it costs the agent to reach out."
              delay={0}
            />
            <MetricCard
              icon={<ShieldCheck className="size-4" />}
              label="Vetted Candidate"
              value="+£25"
              unit="per pass"
              note="Billed when a candidate clears screening."
              tone="paid"
              delay={80}
            />
            <MetricCard
              icon={<Trophy className="size-4" />}
              label="Successful Placement"
              value="+£2,000"
              unit="per hire"
              note="Billed only when you make the hire."
              tone="hero"
              delay={160}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground/70 sm:px-10">
          <span className="flex items-center gap-2">
            <BrandMark className="size-5" />
            Crackd — autonomous hiring agent
          </span>
          <span>Agentic AI track · Paid × Deploy by Antler</span>
        </div>
      </footer>
    </div>
  )
}

function TopBar() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-6 sm:px-10">
      <div className="flex items-center gap-3">
        <BrandMark />
        <div className="flex flex-col leading-none">
          <span className="font-heading text-lg font-bold tracking-tight">
            Crackd
          </span>
          <span className="text-[0.6rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Paid <span className="text-paid">×</span> Deploy by Antler
          </span>
        </div>
      </div>
      <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
        <span className="size-1.5 animate-pulse rounded-full bg-badge-email" />
        Agent online
      </span>
    </div>
  )
}

/** Decorative gold underline stroke beneath "cracked". */
function Underline() {
  return (
    <svg
      className="absolute -bottom-2 left-0 h-2.5 w-full text-primary/60"
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M2 8c40-6 156-6 196 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Live agent feed — a looping preview of the agent working end to end. Mirrors
// the real dashboard activity stream (Task 5) so the pitch shows the product.
// -----------------------------------------------------------------------------

type FeedLine = {
  variant: "processing" | "email" | "reply" | "signal"
  label: string
  text: string
}

const FEED: FeedLine[] = [
  {
    variant: "processing",
    label: "PROCESSING",
    text: "Drafting outreach for Priya Nair…",
  },
  {
    variant: "email",
    label: "EMAIL SENT",
    text: "Delivered to alex.chen@example.com",
  },
  {
    variant: "reply",
    label: "INBOUND REPLY",
    text: "Parsed GitHub repo from Alex Chen",
  },
  {
    variant: "processing",
    label: "REVIEWING",
    text: "Claude scoring take-home — 84/100",
  },
  { variant: "signal", label: "PAID SIGNAL", text: "candidate_vetted · +£25" },
  {
    variant: "signal",
    label: "PAID SIGNAL",
    text: "successful_hire · +£2,000",
  },
]

function LiveAgentFeed() {
  // Seed deterministically so SSR + first client paint match (no hydration warn).
  const [lines, setLines] = useState<FeedLine[]>(() => FEED.slice(0, 4))
  const [cursor, setCursor] = useState(4)

  useEffect(() => {
    const id = setInterval(() => {
      setLines((prev) => {
        const next = FEED[cursor % FEED.length]
        return [next, ...prev].slice(0, 5)
      })
      setCursor((c) => c + 1)
    }, 1900)
    return () => clearInterval(id)
  }, [cursor])

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/60 shadow-2xl shadow-black/40 backdrop-blur">
      {/* glow */}
      <div className="pointer-events-none absolute -top-24 -right-16 size-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-48 rounded-full bg-paid/10 blur-3xl" />

      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-primary" />
          <span className="font-heading text-sm font-semibold">Live agent</span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[0.7rem] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-badge-email" />
          streaming
        </span>
      </div>

      <div className="flex h-[268px] flex-col gap-2 p-4">
        {lines.map((line, i) => (
          <div
            key={`${cursor}-${i}`}
            className={cn(
              "flex items-start gap-2.5 rounded-lg px-2.5 py-2 font-mono text-xs",
              i === 0 && "animate-fade-in-up bg-muted/40"
            )}
          >
            <Badge variant={line.variant} className="mt-px shrink-0">
              {line.label}
            </Badge>
            <span
              className={cn(
                "leading-relaxed",
                line.variant === "signal"
                  ? "font-semibold text-badge-paid"
                  : "text-muted-foreground"
              )}
            >
              {line.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 font-mono text-[0.7rem] text-muted-foreground">
        <span>invoice · Hooli</span>
        <span className="text-foreground">
          running total{" "}
          <span className="font-semibold text-primary">£2,025</span>
        </span>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  note,
  tone = "default",
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  note: string
  tone?: "default" | "paid" | "hero"
  delay?: number
}) {
  return (
    <div
      className={cn(
        "group relative animate-fade-in-up overflow-hidden rounded-xl border p-5 transition-colors",
        tone === "hero"
          ? "border-primary/40 bg-primary/[0.07] hover:bg-primary/[0.1]"
          : tone === "paid"
            ? "border-paid/30 bg-paid/[0.05] hover:bg-paid/[0.08]"
            : "bg-card/50 hover:bg-card"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg",
            tone === "hero"
              ? "bg-primary/15 text-primary"
              : tone === "paid"
                ? "bg-paid/15 text-paid"
                : "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </span>
        {tone === "hero" && (
          <Badge variant="default" className="text-[0.62rem]">
            TOP OUTCOME
          </Badge>
        )}
        {tone === "paid" && (
          <Badge variant="paid" className="text-[0.62rem]">
            PAID
          </Badge>
        )}
      </div>

      <div className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-3xl font-semibold tabular-nums",
            tone === "hero" && "text-primary"
          )}
        >
          {value}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{unit}</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
        {note}
      </p>
    </div>
  )
}
