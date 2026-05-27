"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { X, CheckCircle2 } from "lucide-react"
import type { SettlementStatus } from "@/lib/store"

function rndId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

interface Field {
  id: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}

const FIELDS: Field[] = [
  { id: "settId", label: "Sett ID", placeholder: "Auto-generated or enter custom", required: false },
  { id: "accountId", label: "Account ID", placeholder: "e.g. ACC-10000", required: true },
  { id: "amount", label: "Amount (USD)", type: "number", placeholder: "e.g. 5000.00", required: true },
]

export function AddSettlementForm({ onClose }: { onClose: () => void }) {
  const { addSettlement } = useApp()

  const [form, setForm] = useState({
    settId: rndId("SETT-"),
    accountId: "",
    amount: "",
    status: "completed" as SettlementStatus,
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.accountId.trim()) errs.accountId = "Account ID is required."
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = "Enter a valid positive amount."
    if (!form.description.trim()) errs.description = "Description is required."
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    addSettlement({
      settId: form.settId || rndId("SETT-"),
      accountId: form.accountId.trim(),
      amount: Number(form.amount),
      settTranId: rndId("TXN-"),
      tranHeadId: rndId("HEAD-"),
      issuerSettId: rndId("ISS-"),
      status: form.status,
      description: form.description.trim(),
    })
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
        <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-8 flex flex-col items-center gap-4">
          <div className="rounded-full bg-success/15 p-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Settlement Added</h3>
          <p className="text-sm text-muted-foreground text-center">
            Settlement <span className="font-mono font-medium text-foreground">{form.settId}</span> has been
            successfully recorded.
          </p>
          <button
            onClick={onClose}
            className="mt-2 rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-bold text-foreground">
              New Settlement
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in the fields below. Time is recorded automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map((f) => (
              <div key={f.id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={f.id}
                  className="text-sm font-medium text-foreground"
                >
                  {f.label}
                  {f.required && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </label>
                <input
                  id={f.id}
                  type={f.type ?? "text"}
                  step={f.type === "number" ? "0.01" : undefined}
                  min={f.type === "number" ? "0.01" : undefined}
                  placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.id]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.id]: e.target.value }))
                  }
                  className={`rounded-md border px-3 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors[f.id] ? "border-destructive" : "border-input"
                  }`}
                />
                {errors[f.id] && (
                  <p className="text-xs text-destructive">{errors[f.id]}</p>
                )}
              </div>
            ))}

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="status"
                className="text-sm font-medium text-foreground"
              >
                Status <span className="text-destructive">*</span>
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as SettlementStatus,
                  }))
                }
                className="rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Description — full width */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="e.g. Monthly merchant settlement for Mogadishu region"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={`rounded-md border px-3 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                  errors.description ? "border-destructive" : "border-input"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-accent text-accent-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Save Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
