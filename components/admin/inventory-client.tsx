"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { adjustStock } from "@/lib/actions"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Plus, AlertTriangle, PackagePlus, History } from "lucide-react"

type InventoryRow = {
  id: string
  variant_id: string
  warehouse: string
  qty_on_hand: number
  qty_reserved: number
  reorder_level: number
  reorder_qty: number
  updated_at: string
  product_variants: {
    sku: string
    name: string
    products: { name: string; slug: string }
  }
}

type AdjustmentRow = {
  id: string
  variant_id: string
  adjusted_by: string
  previous_qty: number
  new_qty: number
  reason: string
  created_at: string
  product_variants: {
    sku: string
    name: string
    products: { name: string }
  }
  profiles: { full_name: string }
}

export function AdminInventoryClient({ inventory, adjustments }: { inventory: InventoryRow[]; adjustments: AdjustmentRow[] }) {
  const { user } = useAuth()
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustVariantId, setAdjustVariantId] = useState("")
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [saving, setSaving] = useState(false)

  const lowStockItems = inventory.filter(i => i.qty_on_hand <= i.reorder_level && i.qty_on_hand > 0)

  const handleAdjust = async () => {
    if (!adjustVariantId || !adjustQty) return
    setSaving(true)
    const result = await adjustStock({
      variant_id: adjustVariantId,
      new_qty: parseInt(adjustQty),
      reason: adjustReason || "Manual adjustment",
      adjusted_by: user?.id ?? "unknown",
    })
    if (result.success) {
      toast.success("Stock adjusted!")
      setShowAdjust(false)
      setAdjustVariantId("")
      setAdjustQty("")
      setAdjustReason("")
    } else {
      toast.error(result.error)
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Inventory Management</h2>
        <Dialog open={showAdjust} onOpenChange={setShowAdjust}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Stock Adjustment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Stock Adjustment</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label>Variant</Label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={adjustVariantId}
                  onChange={e => setAdjustVariantId(e.target.value)}
                >
                  <option value="">Select variant...</option>
                  {inventory.map(inv => (
                    <option key={inv.variant_id} value={inv.variant_id}>
                      {inv.product_variants.products.name} - {inv.product_variants.name} ({inv.product_variants.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>New Quantity</Label>
                <Input type="number" placeholder="e.g. 100" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Reason</Label>
                <Textarea placeholder="Inbound shipment, defect removal, etc." value={adjustReason} onChange={e => setAdjustReason(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleAdjust} disabled={saving}>
                {saving ? "Adjusting..." : "Submit Adjustment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(inv => (
                <div key={inv.id} className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                  <PackagePlus className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-foreground">{inv.product_variants.products.name}</span>
                  <span className="text-muted-foreground">({inv.product_variants.sku})</span>
                  <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px]">
                    {inv.qty_on_hand} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-center">On Hand</TableHead>
                <TableHead className="text-center">Reserved</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-center">Reorder Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map(inv => {
                const available = inv.qty_on_hand - inv.qty_reserved
                const status = inv.qty_on_hand <= 0 ? "out-of-stock" : inv.qty_on_hand <= inv.reorder_level ? "low-stock" : "in-stock"
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-foreground">{inv.product_variants.products.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{inv.product_variants.sku}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.product_variants.name}</TableCell>
                    <TableCell className="text-center font-medium text-foreground">{inv.qty_on_hand}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{inv.qty_reserved}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{available}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{inv.reorder_level}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          status === "in-stock" ? "border-primary/30 text-primary" :
                          status === "low-stock" ? "border-yellow-500/30 text-yellow-600" :
                          "border-destructive/30 text-destructive"
                        }
                      >
                        {status === "in-stock" ? "In Stock" : status === "low-stock" ? "Low" : "OOS"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Adjustments */}
      {adjustments.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Previous</TableHead>
                  <TableHead className="text-center">New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.slice(0, 10).map(adj => {
                  const delta = adj.new_qty - adj.previous_qty
                  return (
                    <TableRow key={adj.id}>
                      <TableCell className="text-muted-foreground">{new Date(adj.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{adj.product_variants.sku}</TableCell>
                      <TableCell className="font-medium text-foreground">{adj.product_variants.products.name}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{adj.previous_qty}</TableCell>
                      <TableCell className="text-center">
                        <span className={delta > 0 ? "text-primary font-medium" : "text-destructive font-medium"}>
                          {adj.new_qty} ({delta > 0 ? `+${delta}` : delta})
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{adj.reason}</TableCell>
                      <TableCell className="text-muted-foreground">{adj.profiles?.full_name ?? "System"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
