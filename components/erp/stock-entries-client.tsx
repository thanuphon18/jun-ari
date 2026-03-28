"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package } from "lucide-react"
import { DocStatusBadge } from "./doc-status-badge"
import { formatDate } from "@/lib/erp/format"
import type { StockEntry, DocStatus } from "@/lib/erp/types"

const TYPE_COLORS: Record<string, string> = {
  "Material Receipt": "bg-emerald-100 text-emerald-800",
  "Material Issue": "bg-red-100 text-red-800",
  "Material Transfer": "bg-blue-100 text-blue-800",
}

export function StockEntriesClient({ entries }: { entries: StockEntry[] }) {
  const [search, setSearch] = useState("")

  const filtered = entries.filter(se =>
    se.entry_number.toLowerCase().includes(search.toLowerCase()) ||
    se.entry_type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Entries</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{entries.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Receipts</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{entries.filter(e => e.entry_type === "Material Receipt").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Issues</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{entries.filter(e => e.entry_type === "Material Issue").length}</p>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search stock entries..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2" asChild>
          <Link href="/admin/stock/entries/new"><Plus className="h-4 w-4" />New Stock Entry</Link>
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
                <TableHead>Items</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No stock entries</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(se => (
                  <TableRow key={se.id}>
                    <TableCell>
                      <Link href={`/admin/stock/entries/${se.id}`} className="font-medium text-primary hover:underline">
                        {se.entry_number}
                      </Link>
                    </TableCell>
                    <TableCell><Badge className={TYPE_COLORS[se.entry_type] || ""}>{se.entry_type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(se.posting_date)}</TableCell>
                    <TableCell>{se.stock_entry_items?.length || 0} items</TableCell>
                    <TableCell><DocStatusBadge docstatus={se.docstatus as DocStatus} /></TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{se.remarks || "-"}</TableCell>
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
