"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DocStatusBadge } from "./doc-status-badge"
import { DocWorkflowActions } from "./doc-workflow-actions"
import { Plus, Search } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import { submitPaymentEntry, cancelPaymentEntry } from "@/lib/erp/actions"
import type { PaymentEntry, DocStatus } from "@/lib/erp/types"

export function PaymentsClient({ entries }: { entries: PaymentEntry[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const filtered = entries.filter(e =>
    e.payment_number.toLowerCase().includes(search.toLowerCase()) ||
    e.payment_type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search payments..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => router.push("/admin/accounting/payments/new")} className="gap-2">
          <Plus className="h-4 w-4" /> New Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No payment entries found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-primary">{entry.payment_number}</TableCell>
                    <TableCell className="text-sm">{entry.payment_type}</TableCell>
                    <TableCell className="text-sm">{formatDate(entry.posting_date)}</TableCell>
                    <TableCell><DocStatusBadge docstatus={entry.docstatus as DocStatus} /></TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(entry.paid_amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{entry.remarks || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DocWorkflowActions
                        docstatus={entry.docstatus as DocStatus}
                        docName="Payment Entry"
                        onSubmit={async () => {
                          const result = await submitPaymentEntry(entry.id)
                          if (result.success) router.refresh()
                          return result
                        }}
                        onCancel={async () => {
                          const result = await cancelPaymentEntry(entry.id)
                          if (result.success) router.refresh()
                          return result
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
