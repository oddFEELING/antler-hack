import { Fragment } from "react"

import { cn } from "@/lib/utils"

// Tiny markdown renderer for controlled report content (headings, bold, bullets,
// paragraphs). Deliberately not a full parser — the take-home reports are
// agent-generated against a known shape, so this stays dependency-free.

function inline(text: string) {
  // Split on **bold** and alternate plain / strong.
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function Markdown({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  const lines = content.split("\n")
  const blocks: React.ReactNode[] = []
  let list: string[] = []

  const flushList = (key: string | number) => {
    if (list.length === 0) return
    blocks.push(
      <ul key={`ul-${key}`} className="my-1.5 flex flex-col gap-1">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current text-primary" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>
    )
    list = []
  }

  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    if (line.startsWith("### ")) {
      flushList(i)
      blocks.push(
        <h4
          key={i}
          className="mt-3 mb-0.5 text-xs font-semibold tracking-wide text-foreground uppercase"
        >
          {inline(line.slice(4))}
        </h4>
      )
    } else if (line.startsWith("## ")) {
      flushList(i)
      blocks.push(
        <h3 key={i} className="mt-2 mb-1 text-sm font-semibold text-foreground">
          {inline(line.slice(3))}
        </h3>
      )
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2))
    } else if (line.trim() === "") {
      flushList(i)
    } else {
      flushList(i)
      blocks.push(
        <p key={i} className="my-1 leading-relaxed">
          {inline(line)}
        </p>
      )
    }
  })
  flushList("end")

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {blocks}
    </div>
  )
}
