"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, ArrowLeft, FileText, Receipt } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { createSalesInvoice } from "@/lib/erp/actions"
import { formatCurrency, formatNumber, calculateVat, calculateWht } from "@/lib/erp/format"
import { ProductSearchCombobox, type ProductOption } from "@/components/erp/product-search-combobox"
import { COMPANY_TAX_INFO, type Customer, type Tax } from "@/lib/erp/types"

interface LineItem {
  variant_id: string | null
  item_name: string
  qty: number
  rate: number
}

interface OrderData {
  id: string
  order_number: string
  total: number
  items: { variant_id?: string; item_name: string; qty: number; unit_price: number }[]
  customer_name?: string
  customer_email?: string
}

interface SalesInvoiceFormProps {
  customers: Customer[]
  taxes: Tax[]
  products: ProductOption[]
  orderData?: OrderData | null
}

export function SalesInvoiceForm({ customers, taxes, products, orderData }: SalesInvoiceFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  // Basic fields
  const [customerId, setCustomerId] = useState("")
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)

  // Line items
  const [items, setItems] = useState<LineItem[]>([{ variant_id: null, item_name: "", qty: 1, rate: 0 }])

  // Thai Tax fields
  const [isTaxInvoice, setIsTaxInvoice] = useState(false)
  const [taxInvoiceNumber, setTaxInvoiceNumber] = useState("")
  const [taxInvoiceDate, setTaxInvoiceDate] = useState("")
  const [buyerTaxId, setBuyerTaxId] = useState("")
  const [branchNumber, setBranchNumber] = useState("สำนักงานใหญ่")
  const [vatIncluded, setVatIncluded] = useState(true)
  const [applyVat, setApplyVat] = useState(true)
  const [whtTaxId, setWhtTaxId] = useState("")

  // Taxes
  const vatTaxes = taxes.filter(t => t.tax_category === "VAT")
  const whtTaxes = taxes.filter(t => t.tax_category === "WHT")
  const selectedWht = whtTaxes.find(t => t.id === whtTaxId)

  // Pre-fill from order if provided
  useEffect(() => {
    if (orderData) {
      setOrderId(orderData.id)
      // Pre-fill items from order
      if (orderData.items.length > 0) {
        setItems(orderData.items.map(item => ({
          variant_id: item.variant_id || null,
          item_name: item.item_name,
          qty: item.qty,
          rate: item.unit_price,
        })))
      }
    }
  }, [orderData])

  // Update buyer tax ID when customer changes
  useEffect(() => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setBuyerTaxId(customer.tax_id_13 || customer.tax_id || "")
      setBranchNumber(customer.branch_number || "สำนักงานใหญ่")
    }
  }, [customerId, customers])

  // Calculations
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
  const discountAmount = 0
  const netBeforeVat = subtotal - discountAmount

  // VAT calculation
  let vatAmount = 0
  let netTotal = netBeforeVat
  if (applyVat) {
    if (vatIncluded) {
      // Prices include VAT, extract it
      const { netAmount, vatAmount: vat } = calculateVat(netBeforeVat, true)
      netTotal = netAmount
      vatAmount = vat
    } else {
      // Prices exclude VAT, add it
      const { vatAmount: vat } = calculateVat(netBeforeVat, false)
      vatAmount = vat
      netTotal = netBeforeVat
    }
  }

  const grandTotal = netTotal + vatAmount
  
  // WHT calculation (on net amount before VAT)
  const whtRate = selectedWht ? Number(selectedWht.rate) : 0
  const whtAmount = calculateWht(netTotal, whtRate)

  // Amount customer will actually pay
  const amountDue = grandTotal - whtAmount

  // Line item handlers
  const addLine = () => setItems([...items, { variant_id: null, item_name: "", qty: 1, rate: 0 }])
  const removeLine = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  
  const updateLine = (idx: number, field: keyof LineItem, value: string | number | null) => {
    const updated = [...items]
    if (field === "variant_id") {
      updated[idx].variant_id = value as string | null
    } else if (field === "item_name") {
      updated[idx].item_name = value as string
    } else {
      updated[idx][field] = Number(value)
    }
    setItems(updated)
  }

  const handleProductSelect = (idx: number, product: ProductOption | null) => {
    const updated = [...items]
    if (product) {
      updated[idx] = {
        variant_id: product.id,
        item_name: product.name || product.product_name,
        qty: updated[idx].qty || 1,
        rate: product.price,
      }
    } else {
      updated[idx].variant_id = null
    }
    setItems(updated)
  }

  const handleSubmit = async () => {
    if (!customerId) { toast.error("Please select a customer"); return }
    if (items.some(i => !i.item_name || i.qty <= 0 || i.rate <= 0)) { 
      toast.error("Please complete all line items with valid quantities and rates"); return 
    }
    if (isTaxInvoice && !buyerTaxId) {
      toast.error("Tax Invoice requires buyer's Tax ID"); return
    }

    setLoading(true)
    const result = await createSalesInvoice({
      customer_id: customerId,
      posting_date: postingDate,
      due_date: dueDate || undefined,
      order_id: orderId || undefined,
      items: items.map(i => ({ 
        variant_id: i.variant_id || undefined, 
        item_name: i.item_name, 
        qty: i.qty, 
        rate: i.rate 
      })),
      tax_amount: vatAmount,
      discount_amount: discountAmount,
      // Thai tax fields
      is_tax_invoice: isTaxInvoice,
      tax_invoice_number: taxInvoiceNumber || undefined,
      tax_invoice_date: taxInvoiceDate || postingDate,
      seller_tax_id: COMPANY_TAX_INFO.tax_id,
      buyer_tax_id: buyerTaxId || undefined,
      branch_number: branchNumber,
      vat_included: vatIncluded,
      wht_rate: whtRate,
      wht_amount: whtAmount,
    })

    if (result.success && result.id) {
      toast.success("Sales Invoice created successfully")
      router.push(`/admin/selling/invoices/${result.id}`)
    } else {
      toast.error("error" in result ? result.error : "Failed to create invoice")
    }
    setLoading(false)
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/selling/invoices"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">New Sales Invoice</h2>
          {orderData && (
            <p className="text-sm text-muted-foreground">
              From Order: {orderData.order_number}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Items */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
            <CardDescription>Search products by SKU or name, or enter manually</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Product / Item</TableHead>
                  <TableHead className="w-[12%]">Qty</TableHead>
                  <TableHead className="w-[18%]">Rate (THB)</TableHead>
                  <TableHead className="w-[18%] text-right">Amount</TableHead>
                  <TableHead className="w-[7%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="grid gap-2">
                        <ProductSearchCombobox
                          products={products}
                          value={item.variant_id}
                          onSelect={(p) => handleProductSelect(idx, p)}
                          placeholder="Search product..."
                        />
                        <Input
                          placeholder="Or enter item name manually"
                          value={item.item_name}
                          onChange={e => updateLine(idx, "item_name", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min={1} 
                        value={item.qty} 
                        onChange={e => updateLine(idx, "qty", e.target.value)}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min={0} 
                        step="0.01" 
                        value={item.rate} 
                        onChange={e => updateLine(idx, "rate", e.target.value)}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.qty * item.rate)}
                    </TableCell>
                    <TableCell>
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeLine(idx)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-medium">Subtotal</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(subtotal)}</TableCell>
                  <TableCell />
                </TableRow>
                {applyVat && (
                  <>
                    <TableRow className="text-muted-foreground">
                      <TableCell colSpan={3}>Net Amount (before VAT)</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(netTotal)}</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow className="text-muted-foreground">
                      <TableCell colSpan={3}>VAT 7%</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(vatAmount)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="text-base font-bold">Grand Total</TableCell>
                  <TableCell className="text-right font-mono text-base font-bold">{formatCurrency(grandTotal)}</TableCell>
                  <TableCell />
                </TableRow>
                {whtAmount > 0 && (
                  <>
                    <TableRow className="text-orange-600">
                      <TableCell colSpan={3}>Less: WHT {whtRate}% (หัก ณ ที่จ่าย)</TableCell>
                      <TableCell className="text-right font-mono">-{formatCurrency(whtAmount)}</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={3} className="text-base font-bold text-primary">Amount Due</TableCell>
                      <TableCell className="text-right font-mono text-base font-bold text-primary">{formatCurrency(amountDue)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}
              </TableFooter>
            </Table>
            <div className="p-4">
              <Button variant="outline" size="sm" onClick={addLine} className="gap-2">
                <Plus className="h-4 w-4" />Add Line Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="grid gap-4 self-start">
          {/* Basic Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" />Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Customer <span className="text-destructive">*</span></Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.customer_name}
                        {c.is_vat_registered && <span className="ml-2 text-xs text-muted-foreground">(VAT)</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Posting Date</Label>
                  <Input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thai Tax Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Receipt className="h-4 w-4" />Thai Tax Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="apply-vat">Apply VAT 7%</Label>
                <Checkbox id="apply-vat" checked={applyVat} onCheckedChange={(c) => setApplyVat(!!c)} />
              </div>

              {applyVat && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="vat-included" className="text-sm">Prices include VAT</Label>
                  <Checkbox id="vat-included" checked={vatIncluded} onCheckedChange={(c) => setVatIncluded(!!c)} />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="is-tax-invoice">Issue Tax Invoice (ใบกำกับภาษี)</Label>
                <Checkbox id="is-tax-invoice" checked={isTaxInvoice} onCheckedChange={(c) => setIsTaxInvoice(!!c)} />
              </div>

              {isTaxInvoice && (
                <>
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">Tax Invoice No.</Label>
                    <Input 
                      placeholder="Auto-generated if blank"
                      value={taxInvoiceNumber} 
                      onChange={e => setTaxInvoiceNumber(e.target.value)} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">Buyer Tax ID (13 digits)</Label>
                    <Input 
                      placeholder="0-0000-00000-00-0"
                      value={buyerTaxId} 
                      onChange={e => setBuyerTaxId(e.target.value)} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">Branch</Label>
                    <Input 
                      value={branchNumber} 
                      onChange={e => setBranchNumber(e.target.value)} 
                    />
                  </div>
                </>
              )}

              <Separator />

              <div className="grid gap-2">
                <Label>Withholding Tax (หัก ณ ที่จ่าย)</Label>
                <Select value={whtTaxId} onValueChange={setWhtTaxId}>
                  <SelectTrigger><SelectValue placeholder="No WHT" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Withholding Tax</SelectItem>
                    {whtTaxes.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {whtAmount > 0 && (
                  <p className="text-xs text-orange-600">
                    WHT of {formatCurrency(whtAmount)} will be deducted from payment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Net Amount:</span>
                  <span className="font-mono">{formatCurrency(netTotal)}</span>
                </div>
                {applyVat && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT 7%:</span>
                    <span className="font-mono">{formatCurrency(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Grand Total:</span>
                  <span className="font-mono">{formatCurrency(grandTotal)}</span>
                </div>
                {whtAmount > 0 && (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span>WHT Deduction:</span>
                      <span className="font-mono">-{formatCurrency(whtAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-primary">
                      <span>Amount Due:</span>
                      <span className="font-mono">{formatCurrency(amountDue)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSubmit} disabled={loading} size="lg">
            {loading ? "Creating..." : "Create Invoice (Draft)"}
          </Button>
        </div>
      </div>
    </div>
  )
}
