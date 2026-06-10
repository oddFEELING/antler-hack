import { useRef, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import {
  ArrowLeft,
  Briefcase,
  Building2,
  FileText,
  GitBranch,
  Loader2,
  Rocket,
  UploadCloud,
  Users,
  Wand2,
} from "lucide-react"

import { api } from "../../convex/_generated/api"
import { BrandLockup } from "@/components/brand"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/onboarding")({ component: Onboarding })

// Fixed hiring pipeline for the demo (PRD). Rendered as the pipeline visualizer.
const pipeline = [
  { label: "CV Screening", icon: FileText },
  { label: "Take-Home Assessment", icon: GitBranch },
  { label: "Human Interview", icon: Users },
] as const

const DEMO = {
  companyName: "Hooli",
  roleTitle: "Founding Backend Engineer",
  jobDescription:
    "We're hiring a founding backend engineer to own our core API and data platform. You'll design services from scratch, set the engineering bar, and work directly with the founders. Strong systems fundamentals, a bias for shipping, and excellent code taste required.",
}

type Errors = Partial<
  Record<"companyName" | "roleTitle" | "jobDescription", string>
>

function Onboarding() {
  const navigate = useNavigate()
  const createCampaign = useMutation(api.campaigns.createCampaign)

  const [companyName, setCompanyName] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): Errors {
    const next: Errors = {}
    if (!companyName.trim()) next.companyName = "Company name is required."
    if (!roleTitle.trim()) next.roleTitle = "Role title is required."
    if (jobDescription.trim().length < 20)
      next.jobDescription = "Add a job description (at least 20 characters)."
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      // Create the campaign + seed the 3 candidates, then go to the dashboard.
      // Raced against a short timeout so a not-yet-provisioned backend never
      // strands the demo on the submitting state (PRD demo-resilience ethos).
      await Promise.race([
        createCampaign({
          companyName: companyName.trim(),
          roleTitle: roleTitle.trim(),
          jobDescription: jobDescription.trim(),
        }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ])
    } catch (err) {
      console.warn("createCampaign failed — is `npx convex dev` running?", err)
    }
    navigate({ to: "/dashboard" })
  }

  function prefillDemo() {
    setCompanyName(DEMO.companyName)
    setRoleTitle(DEMO.roleTitle)
    setJobDescription(DEMO.jobDescription)
    setErrors({})
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/">
          <BrandLockup />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/" />}
        >
          <ArrowLeft />
          Back
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16"
      >
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <div className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Step 1 · Setup
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={prefillDemo}
            className="text-muted-foreground"
          >
            <Wand2 />
            Prefill demo
          </Button>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Configure the hiring campaign
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Set the role and job description to initialize the agent's sandbox.
          Deploying ingests the candidates and opens a Paid order.
        </p>

        <Card className="mt-8 gap-0 p-0">
          {/* form fields */}
          <div className="flex flex-col gap-5 border-b border-dashed border-border/70 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Company Name"
                icon={<Building2 className="size-3.5" />}
                error={errors.companyName}
                htmlFor="companyName"
              >
                <Input
                  id="companyName"
                  placeholder="Hooli"
                  value={companyName}
                  aria-invalid={!!errors.companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Field>

              <Field
                label="Target Role Title"
                icon={<Briefcase className="size-3.5" />}
                error={errors.roleTitle}
                htmlFor="roleTitle"
              >
                <Input
                  id="roleTitle"
                  placeholder="Founding Backend Engineer"
                  value={roleTitle}
                  aria-invalid={!!errors.roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Job Description"
              icon={<FileText className="size-3.5" />}
              error={errors.jobDescription}
              htmlFor="jobDescription"
              hint={`${jobDescription.length} chars`}
            >
              <JobDescriptionInput
                value={jobDescription}
                invalid={!!errors.jobDescription}
                onChange={setJobDescription}
              />
            </Field>
          </div>

          {/* pipeline visualizer */}
          <div className="p-6">
            <div className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Hiring process · fixed for the demo
            </div>
            <div className="flex items-center gap-2">
              {pipeline.map((step, i) => (
                <div
                  key={step.label}
                  className="flex flex-1 items-center gap-2"
                >
                  <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-border bg-muted/60 px-3 py-2.5">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <step.icon className="size-3.5" />
                    </span>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {i < pipeline.length - 1 && (
                    <span className="shrink-0 text-muted-foreground">➔</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-6 h-12 self-start px-6 text-base shadow-lg shadow-primary/25"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Initializing funnel…
            </>
          ) : (
            <>
              <Rocket />
              Deploy Agent &amp; Initialize Funnel
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

function Field({
  label,
  icon,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  icon?: React.ReactNode
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {label}
        </Label>
        {hint && (
          <span className="font-mono text-xs text-muted-foreground/60">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** Textarea that also accepts a dropped/uploaded text file as its content. */
function JobDescriptionInput({
  value,
  invalid,
  onChange,
}: {
  value: string
  invalid: boolean
  onChange: (v: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function readFile(file: File | undefined) {
    if (!file) return
    const text = await file.text()
    onChange(text.trim())
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        void readFile(e.dataTransfer.files[0])
      }}
      className={cn(
        "relative rounded-lg transition-colors",
        dragging && "ring-[3px] ring-primary/50"
      )}
    >
      <Textarea
        id="jobDescription"
        placeholder="Paste the job description, or drop a .txt / .md file here…"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-36 pb-9"
      />
      <div className="pointer-events-none absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <UploadCloud className="size-3.5" />
        Drag &amp; drop a file, or
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="pointer-events-auto font-medium text-primary hover:underline"
        >
          browse
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.markdown,text/plain"
        className="hidden"
        onChange={(e) => void readFile(e.target.files?.[0])}
      />
      {dragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 text-sm font-medium text-primary">
          Drop to load job description
        </div>
      )}
    </div>
  )
}
