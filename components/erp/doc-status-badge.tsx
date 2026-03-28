"use client"

import { Badge } from "@/components/ui/badge"
import type { DocStatus } from "@/lib/erp/types"

const STATUS_CONFIG: Record<DocStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "Draft", variant: "secondary" },
  1: { label: "Submitted", variant: "default" },
  2: { label: "Cancelled", variant: "destructive" },
}

export function DocStatusBadge({ docstatus }: { docstatus: DocStatus }) {
  const config = STATUS_CONFIG[docstatus]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
