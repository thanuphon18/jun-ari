"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { createStockEntry } from "@/lib/erp/actions"
import { formatCurrency } from "@/lib/erp/format"
import type { Warehouse } from "@/lib/erp/types"

interface Variant { id: string; sku: string; name: string; price: number; products: { name: string } | null }
interface LineItem { variant_id: string; qty: number; valuation_rate: number }

export function StockEntryForm({ warehouses, variants }: { warehouses: Warehouse[]; variants: Variant[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [entryType, setEntryType] = useState("Material Receipt")
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [sourceWarehouse, setSourceWarehouse] = useState("")
  const [targetWarehouse, setTargetWarehouse] = useState("")
  const [remarks, setRemarks] = useState("")
  const [items, setItems] = useState<LineItem[]>([{ variant_id: "", qty: 1, valuation_rate: 0 }])

  const addLine = () => setItems([...items, { variant_id: "", qty: 1, valuation_rate: 0 }])
  const removeLine = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  const updateLine = (idx: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items]
    if (field === "variant_id") {
      updated[idx].variant_id = value as string
      const v = variants.find(v => v.id === value)
      if (v) updated[idx].valuation_rate = Number(v.price)
    } else {
      (updated[idx] as Record<string, unknown>)[field] = Number(value)
    }
    setItems(updated)
  }

  const showSource = entryType === "Material Issue" || entryType === "Material Transfer"
  const showTarget = entryType === "Material Receipt" || entryType === "Material Transfer"

  const handleSubmit = async () => {
    if (showSource && !sourceWarehouse) { toast.error("Select a source warehouse"); return }
    if (showTarget && !targetWarehouse) { toast.error("Select a target warehouse"); return }
    if (items.some(i => !i.variant_id || i.qty <= 0)) { toast.error("Complete all line items"); return }

    setLoading(true)
    const result = await createStockEntry({
      entry_type: entryType,
      posting_date: postingDate,
      source_warehouse_id: showSource ? sourceWarehouse : undefined,
      target_warehouse_id: showTarget ? targetWarehouse : undefined,
      remarks: remarks || undefined,
      items: items.map(i => ({
        variant_id: i.variant_id,
        qty: i.qty,
        valuation_rate: i.valuation_rate,
      })),
    })
    if (result.success && result.id) {
      toast.success("Stock Entry created")
      router.push(`/admin/stock/entries/${result.id}`)
    } else {
      toast.error("error" in result ? result.error : "Failed")
    }
    setLoading(false)
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/stock/entries"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h2 className="text-lg font-semibold text-foreground">New Stock Entry</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Item</TableHead>
                  <TableHead className="w-[15%]">Qty</TableHead>
                  <TableHead className="w-[20%]">Rate</TableHead>
                  <TableHead className="w-[20%] text-right">Amount</TableHead>
                  <TableHead className="w-[5%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select value={item.variant_id} onValueChange={v => updateLine(idx, "variant_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>
                          {variants.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.sku} - {v.products?.name} ({v.name})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input type="number" min={1} value={item.qty} onChange={e => updateLine(idx, "qty", e.target.value)} /></TableCell>
                    <TableCell><Input type="number" min={0} step="0.01" value={item.valuation_rate} onChange={e => updateLine(idx, "valuation_rate", e.target.value)} /></TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.qty * item.valuation_rate)}</TableCell>
                    <TableCell>{items.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeLine(idx)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-3"><Button variant="outline" size="sm" onClick={addLine} className="gap-2"><Plus className="h-4 w-4" />Add Item</Button></div>
          </CardContent>
        </Card>

        <div className="grid gap-4 self-start">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Entry Type</Label>
                <Select value={entryType} onValueChange={setEntryType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material Receipt">Material Receipt</SelectItem>
                    <SelectItem value="Material Issue">Material Issue</SelectItem>
                    <SelectItem value="Material Transfer">Material Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Posting Date</Label><Input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} /></div>
              {showSource && (
                <div className="grid gap-2">
                  <Label>Source Warehouse</Label>
                  <Select value={sourceWarehouse} onValueChange={setSourceWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {showTarget && (
                <div className="grid gap-2">
                  <Label>Target Warehouse</Label>
                  <Select value={targetWarehouse} onValueChange={setTargetWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2"><Label>Remarks</Label><Textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Creating..." : "Create (Draft)"}</Button>
        </div>
      </div>
    </div>
  )
}
