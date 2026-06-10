import { createContext, useContext, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "../../convex/_generated/api"
import {
  type Invoice,
  aggregateSignals,
  type PaidSignal,
} from "../../convex/schema"
import {
  DEMO_CAMPAIGN,
  DEMO_CANDIDATES,
  DEMO_NOTIFICATIONS,
  DEMO_SIGNALS,
  type BoardCandidate,
} from "@/lib/board"
import type { NotifItem } from "@/lib/notifications"

export type MoneyToast = { id: number; text: string }

type DashboardValue = {
  campaignName: string
  candidates: BoardCandidate[]
  notifications: NotifItem[]
  invoice: Invoice
  isLive: boolean
  pass: (id: string) => void
  reject: (id: string) => void
  toasts: MoneyToast[]
  dismissToast: (id: number) => void
}

const DashboardContext = createContext<DashboardValue | null>(null)

const EMPTY_INVOICE: Invoice = {
  rows: [],
  summary: { totalRevenue: 0, costToServe: 0, netMargin: 0 },
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // ---- live subscriptions (resolve once a Convex deployment exists) ----
  const campaign = useQuery(api.campaigns.getActiveCampaign)
  const skipArgs = campaign?._id ? { campaignId: campaign._id } : "skip"
  const liveCandidates = useQuery(api.candidates.listCandidates, skipArgs)
  const liveNotifs = useQuery(api.notifications.listNotifications, skipArgs)
  const liveInvoice = useQuery(api.billing.getInvoice, skipArgs)
  const passLive = useMutation(api.candidates.passCandidate)
  const rejectLive = useMutation(api.candidates.rejectCandidate)

  // ---- demo fallback state ----
  const [demoCandidates, setDemoCandidates] =
    useState<BoardCandidate[]>(DEMO_CANDIDATES)
  const [demoNotifs, setDemoNotifs] = useState<NotifItem[]>(DEMO_NOTIFICATIONS)
  const [demoSignals, setDemoSignals] = useState<PaidSignal[]>(DEMO_SIGNALS)

  const [toasts, setToasts] = useState<MoneyToast[]>([])
  const toastId = useRef(0)

  const isLive = Array.isArray(liveCandidates) && liveCandidates.length > 0

  const candidates: BoardCandidate[] = isLive ? liveCandidates : demoCandidates
  const notifications: NotifItem[] = isLive ? (liveNotifs ?? []) : demoNotifs
  const invoice: Invoice = isLive
    ? (liveInvoice ?? EMPTY_INVOICE)
    : aggregateSignals(demoSignals)
  const campaignName = campaign
    ? `${campaign.roleTitle} @ ${campaign.companyName}`
    : DEMO_CAMPAIGN

  function pushToast(text: string) {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => dismissToast(id), 4500)
  }
  function dismissToast(id: number) {
    setToasts((t) => t.filter((x) => x.id !== id))
  }

  function pass(id: string) {
    // The hire is the user's explicit action → fire the money toast now, in
    // both modes (avoids fragile diffing of the reactive invoice).
    pushToast(
      "💳 Paid Signal Fired: £2,000 added to invoice for Successful Placement"
    )
    if (isLive) {
      void passLive({ candidateId: id })
      return
    }
    const c = demoCandidates.find((x) => x._id === id)
    setDemoCandidates((d) =>
      d.map((x) => (x._id === id ? { ...x, stage: "hired" } : x))
    )
    setDemoSignals((s) => [...s, "successful_hire"])
    setDemoNotifs((n) => [
      {
        _id: `n-pass-${id}`,
        _creationTime: Date.now(),
        category: "paid_billing",
        badge: "paid_signal",
        description:
          "Fired signal 'successful_hire' (outcome, £2,000) to Paid.",
      },
      {
        _id: `n-pass-sys-${id}`,
        _creationTime: Date.now(),
        category: "system",
        badge: "info",
        description: `Hiring team passed ${c?.name ?? "candidate"}. Advancing to Hired.`,
      },
      ...n,
    ])
  }

  function reject(id: string) {
    if (isLive) {
      void rejectLive({ candidateId: id })
      return
    }
    const c = demoCandidates.find((x) => x._id === id)
    setDemoCandidates((d) =>
      d.map((x) => (x._id === id ? { ...x, stage: "not_hired" } : x))
    )
    setDemoNotifs((n) => [
      {
        _id: `n-rej-${id}`,
        _creationTime: Date.now(),
        category: "system",
        badge: "info",
        description: `Hiring team rejected ${c?.name ?? "candidate"}.`,
      },
      ...n,
    ])
  }

  return (
    <DashboardContext.Provider
      value={{
        campaignName,
        candidates,
        notifications,
        invoice,
        isLive,
        pass,
        reject,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardValue {
  const ctx = useContext(DashboardContext)
  if (!ctx)
    throw new Error("useDashboard must be used within <DashboardProvider>")
  return ctx
}
