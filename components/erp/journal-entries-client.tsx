"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DocStatusBadge } from "./doc-status-badge"
import { Plus, Search } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import type { JournalEntry, DocStatus } from "@/lib/erp/types"

export function JournalEntriesClient({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = entries.filter(e => {
    const matchesSearch = e.entry_number.toLowerCase().includes(search.toLowerCase()) ||
      (e.user_remark ?? "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || String(e.docstatus) === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-9 w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="0">Draft</SelectItem>
              <SelectItem value="1">Submitted</SelectItem>
              <SelectItem value="2">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push("/admin/accounting/journal-entries/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Journal Entry
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Debit</TableHead>
                <TableHead>Remark</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No journal entries found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(entry => (
                  <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/accounting/journal-entries/${entry.id}`)}>
                    <TableCell>
                      <Link href={`/admin/accounting/journal-entries/${entry.id}`} className="font-medium text-primary hover:underline">
                        {entry.entry_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{entry.entry_type}</TableCell>
                    <TableCell className="text-sm">{formatDate(entry.posting_date)}</TableCell>
                    <TableCell><DocStatusBadge docstatus={entry.docstatus as DocStatus} /></TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(entry.total_debit)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{entry.user_remark || "-"}</TableCell>
                    <TableCell className="text-sm">{entry.profiles?.full_name || "-"}</TableCell>
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
