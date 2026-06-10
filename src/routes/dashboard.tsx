import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { Check, ChevronDown, ExternalLink, Sparkles, X } from "lucide-react"

import {
  PIPELINE_COLUMNS,
  columnIndexForStage,
  groupByColumn,
  type BoardCandidate,
} from "@/lib/board"
import { DashboardProvider, useDashboard } from "@/lib/dashboard-store"
import { AppShell } from "@/components/app-shell"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PaidLedger } from "@/components/dashboard/paid-ledger"
import { MoneyToastViewport } from "@/components/dashboard/money-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  ),
})

function Dashboard() {
  const { candidates, campaignName, pass, reject } = useDashboard()
  const { byColumn, declinedList } = groupByColumn(candidates)

  return (
    <AppShell campaignName={campaignName} bleed>
      <MoneyToastViewport />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        {/* main: kanban board */}
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Candidate Pipeline</h1>
            <Badge variant="outline">{candidates.length} candidates</Badge>
          </div>

          <LayoutGroup>
            <div className="flex scrollbar-thin gap-3 overflow-x-auto pb-3">
              {PIPELINE_COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  label={col.label}
                  candidates={byColumn[col.id]}
                  onPass={pass}
                  onReject={reject}
                />
              ))}
            </div>
            <DeclinedBin candidates={declinedList} />
          </LayoutGroup>
        </section>

        {/* right rail — Activity Feed (top) + Paid "Live Receipt" (bottom) */}
        <aside className="flex min-w-0 flex-col gap-5">
          <ActivityFeed />
          <PaidLedger />
        </aside>
      </div>
    </AppShell>
  )
}

// ----------------------------------------------------------------- Column ----

function Column({
  label,
  candidates,
  onPass,
  onReject,
}: {
  label: string
  candidates: BoardCandidate[]
  onPass: (id: string) => void
  onReject: (id: string) => void
}) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-xl border bg-card/40">
      <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="rounded bg-muted/60 px-1.5 font-mono text-xs text-muted-foreground">
          {candidates.length}
        </span>
      </div>
      <div className="flex min-h-44 flex-col gap-2.5 p-2.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {candidates.map((c) => (
            <motion.div
              key={c._id}
              layout
              layoutId={c._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            >
              <CandidateCard
                candidate={c}
                onPass={onPass}
                onReject={onReject}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {candidates.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-6 text-xs text-muted-foreground/40">
            empty
          </div>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------ Candidate ------

function CandidateCard({
  candidate,
  onPass,
  onReject,
}: {
  candidate: BoardCandidate
  onPass: (id: string) => void
  onReject: (id: string) => void
}) {
  const [showReport, setShowReport] = useState(false)
  const inInterview = candidate.stage === "in_interview"

  return (
    <div className="group rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-center gap-2.5">
        <Avatar name={candidate.name} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{candidate.name}</div>
          <div className="truncate font-mono text-[0.7rem] text-muted-foreground">
            {candidate.email}
          </div>
        </div>
      </div>

      <StageTracker stage={candidate.stage} />

      {candidate.githubUrl && (
        <a
          href={candidate.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-1.5 truncate font-mono text-[0.7rem] text-muted-foreground transition-colors hover:text-primary"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="truncate">
            {candidate.githubUrl.replace("https://", "")}
          </span>
        </a>
      )}

      {/* Take-home report toggle */}
      {candidate.takeHomeReport && (
        <div className="mt-2.5">
          <button
            onClick={() => setShowReport((s) => !s)}
            className="flex w-full items-center justify-between rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              View Claude Take-Home Report
            </span>
            <span className="flex items-center gap-1.5">
              {typeof candidate.takeHomeScore === "number" && (
                <span className="font-mono">{candidate.takeHomeScore}/100</span>
              )}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  showReport && "rotate-180"
                )}
              />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showReport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-md border border-border/70 bg-muted/30 p-3">
                  <Markdown content={candidate.takeHomeReport} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Human-in-the-loop interview decision */}
      {inInterview && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => onReject(candidate._id)}
          >
            <X />
            Reject
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-badge-email/15 text-badge-email hover:bg-badge-email/25"
            onClick={() => onPass(candidate._id)}
          >
            <Check />
            Pass &amp; Hire
          </Button>
        </div>
      )}
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const palette = [
    "bg-primary/15 text-primary",
    "bg-paid/15 text-paid",
    "bg-badge-email/15 text-badge-email",
    "bg-badge-reply/15 text-badge-reply",
  ]
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        palette[h % palette.length]
      )}
    >
      {initials}
    </span>
  )
}

function StageTracker({ stage }: { stage: BoardCandidate["stage"] }) {
  const idx = columnIndexForStage(stage)
  const last = PIPELINE_COLUMNS.length - 1
  return (
    <div className="mt-3 flex gap-1">
      {PIPELINE_COLUMNS.map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i <= idx
              ? idx === last
                ? "bg-badge-email"
                : "bg-primary"
              : "bg-border"
          )}
        />
      ))}
    </div>
  )
}

// --------------------------------------------------------- Declined bin ------

function DeclinedBin({ candidates }: { candidates: BoardCandidate[] }) {
  return (
    <motion.div
      layout
      className="mt-3 rounded-lg border border-dashed border-border/60 px-4 py-2.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
          Declined / Opted Out
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          {candidates.map((c) => (
            <motion.span
              key={c._id}
              layout
              layoutId={c._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.55, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground line-through"
            >
              {c.name}
            </motion.span>
          ))}
        </AnimatePresence>
        {candidates.length === 0 && (
          <span className="text-xs text-muted-foreground/40">none</span>
        )}
      </div>
    </motion.div>
  )
}
