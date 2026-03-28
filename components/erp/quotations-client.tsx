"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText } from "lucide-react"
import { DocStatusBadge } from "./doc-status-badge"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import type { Quotation, DocStatus } from "@/lib/erp/types"

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Open: "bg-blue-100 text-blue-800",
  Ordered: "bg-emerald-100 text-emerald-800",
  Lost: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-500",
}

export function QuotationsClient({ quotations }: { quotations: Quotation[] }) {
  const [search, setSearch] = useState("")

  const filtered = quotations.filter(q =>
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    q.customers?.customer_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search quotations..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2" asChild>
          <Link href="/admin/selling/quotations/new"><Plus className="h-4 w-4" />New Quotation</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No quotations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(q => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Link href={`/admin/selling/quotations/${q.id}`} className="font-medium text-primary hover:underline">
                        {q.quotation_number}
                      </Link>
                    </TableCell>
                    <TableCell>{q.customers?.customer_name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(q.posting_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{q.valid_until ? formatDate(q.valid_until) : "-"}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[q.status] || ""}>{q.status}</Badge>
                    </TableCell>
                    <TableCell><DocStatusBadge docstatus={q.docstatus as DocStatus} /></TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(q.grand_total)}</TableCell>
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
