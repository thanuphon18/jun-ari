"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DocStatusBadge } from "./doc-status-badge"
import { DocWorkflowActions } from "./doc-workflow-actions"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import { submitQuotation, cancelQuotation } from "@/lib/erp/actions"
import type { Quotation, DocStatus } from "@/lib/erp/types"

export function QuotationDetail({ quotation }: { quotation: Quotation }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/selling/quotations"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{quotation.quotation_number}</h2>
          <p className="text-sm text-muted-foreground">{quotation.customers?.customer_name}</p>
        </div>
        <DocStatusBadge docstatus={quotation.docstatus as DocStatus} />
        <DocWorkflowActions
          docstatus={quotation.docstatus as DocStatus}
          onSubmit={() => submitQuotation(quotation.id)}
          onCancel={() => cancelQuotation(quotation.id)}
          docName={quotation.quotation_number}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.quotation_items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.rate)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow><TableCell colSpan={3}>Subtotal</TableCell><TableCell className="text-right font-mono">{formatCurrency(quotation.subtotal)}</TableCell></TableRow>
                {Number(quotation.tax_amount) > 0 && <TableRow><TableCell colSpan={3} className="text-muted-foreground">Tax</TableCell><TableCell className="text-right font-mono">{formatCurrency(quotation.tax_amount)}</TableCell></TableRow>}
                <TableRow><TableCell colSpan={3} className="font-bold">Grand Total</TableCell><TableCell className="text-right font-mono font-bold">{formatCurrency(quotation.grand_total)}</TableCell></TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{formatDate(quotation.posting_date)}</span></div>
            {quotation.valid_until && <div className="flex justify-between"><span className="text-muted-foreground">Valid Until</span><span className="font-medium">{formatDate(quotation.valid_until)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{quotation.customers?.customer_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created by</span><span className="font-medium">{quotation.profiles?.full_name || "-"}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
