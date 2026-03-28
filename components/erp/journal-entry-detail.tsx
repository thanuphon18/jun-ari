"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DocStatusBadge } from "./doc-status-badge"
import { DocWorkflowActions } from "./doc-workflow-actions"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import { submitJournalEntry, cancelJournalEntry } from "@/lib/erp/actions"
import { ArrowLeft } from "lucide-react"
import type { JournalEntry, DocStatus } from "@/lib/erp/types"
import { useRouter } from "next/navigation"

export function JournalEntryDetail({ entry }: { entry: JournalEntry }) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/accounting/journal-entries" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{entry.entry_number}</h2>
            <DocStatusBadge docstatus={entry.docstatus as DocStatus} />
          </div>
          <p className="text-sm text-muted-foreground">{entry.entry_type} &middot; {formatDate(entry.posting_date)}</p>
        </div>
        <DocWorkflowActions
          docstatus={entry.docstatus as DocStatus}
          docName="Journal Entry"
          onSubmit={async () => {
            const result = await submitJournalEntry(entry.id)
            if (result.success) router.refresh()
            return result
          }}
          onCancel={async () => {
            const result = await cancelJournalEntry(entry.id)
            if (result.success) router.refresh()
            return result
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Debit</p>
            <p className="text-lg font-bold font-mono text-foreground">{formatCurrency(entry.total_debit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Credit</p>
            <p className="text-lg font-bold font-mono text-foreground">{formatCurrency(entry.total_credit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Created By</p>
            <p className="text-sm font-medium text-foreground">{entry.profiles?.full_name || "System"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Remark</p>
            <p className="text-sm text-foreground">{entry.user_remark || "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Accounting Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(entry.journal_entry_items ?? []).map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    {item.accounts?.account_number && (
                      <span className="mr-2 font-mono text-xs text-muted-foreground">{item.accounts.account_number}</span>
                    )}
                    {item.accounts?.name || item.account_id}
                  </TableCell>
                  <TableCell className="text-sm">{item.cost_centers?.name || "-"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(item.debit) > 0 ? formatCurrency(item.debit) : "-"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(item.credit) > 0 ? formatCurrency(item.credit) : "-"}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={3} className="text-right">Totals</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(entry.total_debit)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(entry.total_credit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
