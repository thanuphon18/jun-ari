"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DocStatusBadge } from "./doc-status-badge"
import { DocWorkflowActions } from "./doc-workflow-actions"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import { submitStockEntry, cancelStockEntry } from "@/lib/erp/actions"
import type { StockEntry, DocStatus } from "@/lib/erp/types"

const TYPE_COLORS: Record<string, string> = {
  "Material Receipt": "bg-emerald-100 text-emerald-800",
  "Material Issue": "bg-red-100 text-red-800",
  "Material Transfer": "bg-blue-100 text-blue-800",
}

export function StockEntryDetail({ entry }: { entry: StockEntry }) {
  const totalAmount = entry.stock_entry_items?.reduce((s, i) => s + Number(i.amount), 0) ?? 0

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/stock/entries"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{entry.entry_number}</h2>
          <p className="text-sm text-muted-foreground">{entry.entry_type}</p>
        </div>
        <Badge className={TYPE_COLORS[entry.entry_type] || ""}>{entry.entry_type}</Badge>
        <DocStatusBadge docstatus={entry.docstatus as DocStatus} />
        <DocWorkflowActions
          docstatus={entry.docstatus as DocStatus}
          onSubmit={() => submitStockEntry(entry.id)}
          onCancel={() => cancelStockEntry(entry.id)}
          docName={entry.entry_number}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.stock_entry_items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.product_variants?.sku || "-"}</TableCell>
                    <TableCell className="font-medium">{item.product_variants?.products?.name} - {item.product_variants?.name}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.valuation_rate)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{formatDate(entry.posting_date)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Value</span><span className="font-mono font-medium">{formatCurrency(totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created by</span><span className="font-medium">{entry.profiles?.full_name || "-"}</span></div>
            {entry.remarks && (
              <div className="mt-2 rounded-md bg-muted p-3 text-sm">{entry.remarks}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
