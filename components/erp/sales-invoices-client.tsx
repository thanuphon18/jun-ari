"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText } from "lucide-react"
import { DocStatusBadge } from "./doc-status-badge"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import type { SalesInvoice, DocStatus } from "@/lib/erp/types"

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Unpaid: "bg-amber-100 text-amber-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Overdue: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-500",
  Return: "bg-violet-100 text-violet-800",
}

export function SalesInvoicesClient({ invoices }: { invoices: SalesInvoice[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = invoices.filter(si => {
    const matchesSearch = si.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      si.customers?.customer_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || si.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalOutstanding = invoices.filter(si => si.docstatus === 1).reduce((s, si) => s + Number(si.outstanding_amount), 0)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Invoices</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{invoices.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{formatCurrency(totalOutstanding)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{invoices.filter(si => si.status === "Paid").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Drafts</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">{invoices.filter(si => si.docstatus === 0).length}</p>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" asChild>
          <Link href="/admin/selling/invoices/new"><Plus className="h-4 w-4" />New Invoice</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No invoices found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(si => (
                  <TableRow key={si.id}>
                    <TableCell>
                      <Link href={`/admin/selling/invoices/${si.id}`} className="font-medium text-primary hover:underline">
                        {si.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>{si.customers?.customer_name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(si.posting_date)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[si.status] || ""}>{si.status}</Badge>
                    </TableCell>
                    <TableCell><DocStatusBadge docstatus={si.docstatus as DocStatus} /></TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(si.grand_total)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(si.outstanding_amount)}</TableCell>
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
