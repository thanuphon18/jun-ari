"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { DocStatus } from "@/lib/erp/types"

interface DocWorkflowActionsProps {
  docstatus: DocStatus
  onSubmit: () => Promise<{ success: boolean; error?: string }>
  onCancel: () => Promise<{ success: boolean; error?: string }>
  docName: string
}

export function DocWorkflowActions({ docstatus, onSubmit, onCancel, docName }: DocWorkflowActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const result = await onSubmit()
    if (result.success) {
      toast.success(`${docName} submitted successfully`)
    } else {
      toast.error(result.error || "Failed to submit")
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    setLoading(true)
    const result = await onCancel()
    if (result.success) {
      toast.success(`${docName} cancelled`)
    } else {
      toast.error(result.error || "Failed to cancel")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Button disabled size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    )
  }

  if (docstatus === 0) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Submit
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit {docName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Submitted documents post to the ledger and cannot be edited. You can cancel a submitted document to reverse its effects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Confirm Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (docstatus === 1) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-2">
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {docName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reverse all ledger entries created by this document. This action follows the Frappe amend workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // docstatus === 2 (cancelled) — no actions
  return (
    <span className="text-sm text-muted-foreground italic">Cancelled</span>
  )
}
