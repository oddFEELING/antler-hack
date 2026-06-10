import { AnimatePresence, motion } from "motion/react"

import { useDashboard } from "@/lib/dashboard-store"

/**
 * Global "money" toasts — fired top-center when a major monetary event lands
 * (e.g. successful_hire / £2,000). Branded with the Paid violet so it reads as
 * a Paid signal interrupting the UI.
 */
export function MoneyToastViewport() {
  const { toasts, dismissToast } = useDashboard()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => dismissToast(t.id)}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-paid/60 bg-paid/20 px-4 py-2.5 text-sm font-semibold text-paid-foreground shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <span className="size-2 animate-pulse rounded-full bg-paid shadow-[0_0_10px_2px] shadow-paid/70" />
            {t.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
