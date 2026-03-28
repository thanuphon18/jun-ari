"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, FileText, Receipt, Building2 } from "lucide-react"
import { DocStatusBadge } from "./doc-status-badge"
import { DocWorkflowActions } from "./doc-workflow-actions"
import { formatCurrency, formatDate, formatThaiTaxDate, formatThaiTaxId } from "@/lib/erp/format"
import { submitSalesInvoice, cancelSalesInvoice } from "@/lib/erp/actions"
import { COMPANY_TAX_INFO } from "@/lib/erp/types"
import type { SalesInvoice, DocStatus } from "@/lib/erp/types"

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Unpaid: "bg-amber-100 text-amber-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Overdue: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-500",
  Return: "bg-purple-100 text-purple-800",
}

export function SalesInvoiceDetail({ invoice }: { invoice: SalesInvoice }) {
  const hasWht = Number(invoice.wht_amount || 0) > 0
  const amountDue = Number(invoice.grand_total) - Number(invoice.wht_amount || 0)
  
  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/selling/invoices"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{invoice.invoice_number}</h2>
            {invoice.is_tax_invoice && (
              <Badge variant="outline" className="gap-1 border-primary text-primary">
                <Receipt className="h-3 w-3" />Tax Invoice
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{invoice.customers?.customer_name}</p>
        </div>
        <DocStatusBadge docstatus={invoice.docstatus as DocStatus} />
        <Badge className={STATUS_COLORS[invoice.status] || ""}>{invoice.status}</Badge>
        <DocWorkflowActions
          docstatus={invoice.docstatus as DocStatus}
          onSubmit={() => submitSalesInvoice(invoice.id)}
          onCancel={() => cancelSalesInvoice(invoice.id)}
          docName={invoice.invoice_number}
        />
        {invoice.docstatus === 1 && Number(invoice.outstanding_amount) > 0 && (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/admin/accounting/payments/new?ref_type=Sales Invoice&ref_id=${invoice.id}&amount=${invoice.outstanding_amount}&party_type=Customer&party_id=${invoice.customer_id}`}>
              <CreditCard className="h-4 w-4" />Make Payment
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Line Items */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate (THB)</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.sales_invoice_items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.rate)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(invoice.subtotal)}</TableCell>
                </TableRow>
                {Number(invoice.discount_amount) > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">Discount</TableCell>
                    <TableCell className="text-right font-mono text-red-600">-{formatCurrency(invoice.discount_amount)}</TableCell>
                  </TableRow>
                )}
                {Number(invoice.net_total) > 0 && invoice.net_total !== invoice.subtotal && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">Net Amount (before VAT)</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(invoice.net_total)}</TableCell>
                  </TableRow>
                )}
                {Number(invoice.tax_amount) > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">VAT 7%</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(invoice.tax_amount)}</TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="text-base font-bold">Grand Total</TableCell>
                  <TableCell className="text-right font-mono text-base font-bold">{formatCurrency(invoice.grand_total)}</TableCell>
                </TableRow>
                {hasWht && (
                  <>
                    <TableRow className="text-orange-600">
                      <TableCell colSpan={3}>Less: WHT {Number(invoice.wht_rate)}% (หัก ณ ที่จ่าย)</TableCell>
                      <TableCell className="text-right font-mono">-{formatCurrency(invoice.wht_amount)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={3} className="text-base font-bold text-primary">Amount Due</TableCell>
                      <TableCell className="text-right font-mono text-base font-bold text-primary">{formatCurrency(amountDue)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="grid gap-4 self-start">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" />Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posting Date</span>
                <span className="font-medium">{formatDate(invoice.posting_date)}</span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{formatDate(invoice.due_date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{invoice.customers?.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created by</span>
                <span className="font-medium">{invoice.profiles?.full_name || "-"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount</span>
                <span className="font-mono font-medium text-emerald-600">{formatCurrency(invoice.paid_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-mono font-medium text-amber-600">{formatCurrency(invoice.outstanding_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Thai Tax Invoice Info */}
          {invoice.is_tax_invoice && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Receipt className="h-4 w-4" />Tax Invoice Details
                </CardTitle>
                <CardDescription>ใบกำกับภาษี</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                {invoice.tax_invoice_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Invoice No.</span>
                    <span className="font-mono font-medium">{invoice.tax_invoice_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Invoice Date</span>
                  <span className="font-medium">{formatThaiTaxDate(invoice.tax_invoice_date || invoice.posting_date)}</span>
                </div>
                <Separator />
                <div className="text-xs font-medium uppercase text-muted-foreground">Seller (ผู้ออก)</div>
                <div className="rounded-md bg-background p-2">
                  <p className="font-medium">{COMPANY_TAX_INFO.name}</p>
                  <p className="text-muted-foreground">Tax ID: {formatThaiTaxId(invoice.seller_tax_id || COMPANY_TAX_INFO.tax_id)}</p>
                  <p className="text-muted-foreground">{COMPANY_TAX_INFO.branch}</p>
                </div>
                <div className="text-xs font-medium uppercase text-muted-foreground">Buyer (ผู้ซื้อ)</div>
                <div className="rounded-md bg-background p-2">
                  <p className="font-medium">{invoice.customers?.customer_name}</p>
                  <p className="text-muted-foreground">Tax ID: {formatThaiTaxId(invoice.buyer_tax_id)}</p>
                  <p className="text-muted-foreground">{invoice.branch_number || "สำนักงานใหญ่"}</p>
                </div>
                <Separator />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Prices Include VAT</span>
                  <span className="font-medium">{invoice.vat_included ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* WHT Info */}
          {hasWht && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                  <Building2 className="h-4 w-4" />Withholding Tax
                </CardTitle>
                <CardDescription className="text-orange-600">หัก ณ ที่จ่าย</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-600">WHT Rate</span>
                  <span className="font-medium text-orange-700">{Number(invoice.wht_rate)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">WHT Amount</span>
                  <span className="font-mono font-medium text-orange-700">{formatCurrency(invoice.wht_amount)}</span>
                </div>
                <p className="mt-2 text-xs text-orange-600">
                  Customer will deduct this amount and remit to the Revenue Department
                </p>
              </CardContent>
            </Card>
          )}

          {/* Order Reference */}
          {invoice.order_id && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">From Order</span>
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <Link href={`/admin/orders/${invoice.order_id}`}>View Order</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
