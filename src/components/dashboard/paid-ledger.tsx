import { useEffect, useRef, useState } from "react"

import { useDashboard } from "@/lib/dashboard-store"
import type { PaidSignal } from "../../../convex/schema"
import { cn } from "@/lib/utils"

// Receipt palette — deliberately OFF the dark theme so the Paid panel is
// impossible to miss (a physical printed invoice on the dashboard).
const INK = "#26211c"
const MUTED = "#8a8073"
const VIOLET = "#6d28d9"
const CREAM = "#f4eee2"

function gbp(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export function PaidLedger() {
  const { invoice } = useDashboard()
  const { rows, summary } = invoice

  // Revenue increment → pulse + green flash.
  const prevRevenue = useRef(summary.totalRevenue)
  const [revKey, setRevKey] = useState(0)
  const [revFlash, setRevFlash] = useState(false)
  useEffect(() => {
    if (summary.totalRevenue > prevRevenue.current) {
      setRevKey((k) => k + 1)
      setRevFlash(true)
      const t = setTimeout(() => setRevFlash(false), 900)
      prevRevenue.current = summary.totalRevenue
      return () => clearTimeout(t)
    }
    prevRevenue.current = summary.totalRevenue
  }, [summary.totalRevenue])

  // New invoice row → yellow highlight fade. Seed "seen" with the initial rows
  // so nothing flashes on first paint.
  const [seen, setSeen] = useState<Set<PaidSignal>>(
    () => new Set(rows.map((r) => r.signal))
  )
  const newSignals = rows
    .filter((r) => !seen.has(r.signal))
    .map((r) => r.signal)
  const newKey = newSignals.join(",")
  useEffect(() => {
    if (newSignals.length === 0) return
    setSeen((prev) => {
      const next = new Set(prev)
      newSignals.forEach((s) => next.add(s))
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newKey])

  return (
    <div className="overflow-hidden rounded-xl">
      <ZigzagEdge side="top" />
      <div
        className="px-4 pt-3 pb-4 font-mono shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]"
        style={{ backgroundColor: CREAM, color: INK }}
      >
        {/* branded header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-[0.72rem] font-bold tracking-[0.2em] text-white"
              style={{ backgroundColor: VIOLET }}
            >
              PAID
            </span>
            <span
              className="text-[0.62rem] tracking-[0.16em] uppercase"
              style={{ color: MUTED }}
            >
              Live Invoice
            </span>
          </div>
          <span className="text-[0.65rem]" style={{ color: MUTED }}>
            #CRK-0001
          </span>
        </div>

        <div
          className="mt-3 border-t border-dashed"
          style={{ borderColor: "rgba(38,33,28,0.25)" }}
        />

        {/* financial summary */}
        <div className="mt-3">
          <div
            className="text-[0.6rem] tracking-[0.14em] uppercase"
            style={{ color: MUTED }}
          >
            Total Revenue
          </div>
          <div
            key={revKey}
            className={cn(
              "text-3xl font-bold tabular-nums",
              revFlash && "animate-pulse-once"
            )}
            style={{ color: revFlash ? "#16a34a" : INK }}
          >
            {gbp(summary.totalRevenue)}
          </div>
        </div>

        {/* running invoice table */}
        <table className="mt-4 w-full border-collapse text-[0.7rem]">
          <thead>
            <tr
              className="text-left tracking-wide uppercase"
              style={{ color: MUTED }}
            >
              <th className="pb-1 font-medium">Signal</th>
              <th className="pb-1 font-medium">Type</th>
              <th className="pb-1 text-right font-medium">Unit</th>
              <th className="pb-1 text-right font-medium">Qty</th>
              <th className="pb-1 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.signal}
                className={cn(
                  "border-t",
                  newSignals.includes(r.signal) && "animate-flash"
                )}
                style={{ borderColor: "rgba(38,33,28,0.12)" }}
              >
                <td className="py-1.5 pr-2">{r.signal}</td>
                <td className="py-1.5">
                  <span
                    className="rounded px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase"
                    style={
                      r.type === "outcome"
                        ? {
                            backgroundColor: "rgba(109,40,217,0.12)",
                            color: VIOLET,
                          }
                        : {
                            backgroundColor: "rgba(38,33,28,0.08)",
                            color: MUTED,
                          }
                    }
                  >
                    {r.type}
                  </span>
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  {gbp(r.unitPrice)}
                </td>
                <td className="py-1.5 text-right tabular-nums">{r.qty}</td>
                <td
                  className="py-1.5 text-right font-semibold tabular-nums"
                  style={{ color: r.totalBilled > 0 ? INK : MUTED }}
                >
                  {gbp(r.totalBilled)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 text-center"
                  style={{ color: MUTED }}
                >
                  No signals fired yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* total */}
        <div
          className="mt-3 flex items-center justify-between border-t border-dashed pt-2.5 text-sm font-bold"
          style={{ borderColor: "rgba(38,33,28,0.25)" }}
        >
          <span className="tracking-wide uppercase">Total billed</span>
          <span className="tabular-nums">{gbp(summary.totalRevenue)}</span>
        </div>
      </div>
      <ZigzagEdge side="bottom" />
    </div>
  )
}

/** Torn perforated receipt edge, drawn as a cream sawtooth SVG. */
function ZigzagEdge({ side }: { side: "top" | "bottom" }) {
  const teeth = 26
  const w = 100
  const h = 6
  const pts: string[] = []
  if (side === "top") {
    pts.push(`0,${h}`)
    for (let i = 0; i <= teeth; i++) {
      const x = (i / teeth) * w
      const y = i % 2 === 0 ? 0 : h
      pts.push(`${x.toFixed(2)},${y}`)
    }
    pts.push(`${w},${h}`)
  } else {
    pts.push(`0,0`)
    for (let i = 0; i <= teeth; i++) {
      const x = (i / teeth) * w
      const y = i % 2 === 0 ? h : 0
      pts.push(`${x.toFixed(2)},${y}`)
    }
    pts.push(`${w},0`)
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block h-1.5 w-full"
      aria-hidden
    >
      <polygon points={pts.join(" ")} fill={CREAM} />
    </svg>
  )
}
