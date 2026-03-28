"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Plus, Trash2, ArrowLeft, FileText, Receipt } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { createQuotation } from "@/lib/erp/actions"
import { formatCurrency, calculateVat } from "@/lib/erp/format"
import { ProductSearchCombobox, type ProductOption } from "@/components/erp/product-search-combobox"
import type { Customer, Tax } from "@/lib/erp/types"

interface LineItem {
  variant_id: string | null
  item_name: string
  qty: number
  rate: number
}

interface QuotationFormProps {
  customers: Customer[]
  taxes: Tax[]
  products: ProductOption[]
}

export function QuotationForm({ customers, taxes, products }: QuotationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState("")
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [validUntil, setValidUntil] = useState("")
  const [items, setItems] = useState<LineItem[]>([{ variant_id: null, item_name: "", qty: 1, rate: 0 }])

  // VAT settings
  const [applyVat, setApplyVat] = useState(true)
  const [vatIncluded, setVatIncluded] = useState(true)

  // Calculations
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
  const discountAmount = 0

  // VAT calculation
  let vatAmount = 0
  let netTotal = subtotal - discountAmount
  if (applyVat) {
    if (vatIncluded) {
      const { netAmount, vatAmount: vat } = calculateVat(netTotal, true)
      netTotal = netAmount
      vatAmount = vat
    } else {
      const { vatAmount: vat } = calculateVat(netTotal, false)
      vatAmount = vat
    }
  }
  const grandTotal = netTotal + vatAmount

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
      toast.error("Please complete all line items"); return 
    }
    
    setLoading(true)
    const result = await createQuotation({
      customer_id: customerId,
      posting_date: postingDate,
      valid_until: validUntil || undefined,
      items: items.map(i => ({ 
        variant_id: i.variant_id || undefined, 
        item_name: i.item_name, 
        qty: i.qty, 
        rate: i.rate 
      })),
      tax_amount: vatAmount,
    })
    
    if (result.success && result.id) {
      toast.success("Quotation created successfully")
      router.push(`/admin/selling/quotations/${result.id}`)
    } else {
      toast.error("error" in result ? result.error : "Failed to create quotation")
    }
    setLoading(false)
  }

  // Set default validity (30 days from posting date)
  useEffect(() => {
    if (postingDate && !validUntil) {
      const date = new Date(postingDate)
      date.setDate(date.getDate() + 30)
      setValidUntil(date.toISOString().slice(0, 10))
    }
  }, [postingDate, validUntil])

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/selling/quotations"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">New Quotation</h2>
          <p className="text-sm text-muted-foreground">Create a price quotation for customer</p>
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
                <FileText className="h-4 w-4" />Quotation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Customer <span className="text-destructive">*</span></Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.customer_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Valid Until</Label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VAT Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Receipt className="h-4 w-4" />VAT Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="apply-vat">Include VAT 7%</Label>
                <Checkbox id="apply-vat" checked={applyVat} onCheckedChange={(c) => setApplyVat(!!c)} />
              </div>
              {applyVat && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="vat-included" className="text-sm">Prices include VAT</Label>
                  <Checkbox id="vat-included" checked={vatIncluded} onCheckedChange={(c) => setVatIncluded(!!c)} />
                </div>
              )}
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
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Grand Total:</span>
                  <span className="font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSubmit} disabled={loading} size="lg">
            {loading ? "Creating..." : "Create Quotation (Draft)"}
          </Button>
        </div>
      </div>
    </div>
  )
}
