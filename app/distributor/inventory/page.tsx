"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { Loader2 } from "lucide-react"

interface InventoryRow {
  id: string
  qty_on_hand: number
  qty_reserved: number
  reorder_level: number
  product_variants: {
    name: string
    sku: string
    products: { name: string }
  }
}

export default function DistributorInventoryPage() {
  const supabase = createClient()

  const { data: inventoryData, isLoading } = useSWR<InventoryRow[]>(
    "distributor-inventory",
    async () => {
      const { data } = await supabase
        .from("inventory")
        .select("*, product_variants(name, sku, products(name))")
        .order("updated_at", { ascending: false })
      return (data ?? []) as InventoryRow[]
    }
  )

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Inventory Allocation</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        View current stock levels and reservation status across all variants.
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-center">On Hand</TableHead>
                <TableHead className="text-center">Reserved</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(inventoryData ?? []).map(inv => {
                const available = inv.qty_on_hand - inv.qty_reserved
                const status = inv.qty_on_hand === 0 ? "out" : inv.qty_on_hand <= inv.reorder_level ? "low" : "ok"
                const usagePercent = inv.qty_on_hand > 0 ? (inv.qty_reserved / inv.qty_on_hand) * 100 : 0

                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-foreground">{inv.product_variants?.products?.name}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.product_variants?.name}</TableCell>
                    <TableCell className="text-center text-foreground">{inv.qty_on_hand}</TableCell>
                    <TableCell className="text-center text-primary font-medium">{inv.qty_reserved}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{available}</TableCell>
                    <TableCell>
                      <Badge className={
                        status === "ok" ? "bg-success text-success-foreground" :
                        status === "low" ? "bg-warning text-warning-foreground" :
                        "bg-destructive text-destructive-foreground"
                      }>
                        {status === "ok" ? "In Stock" : status === "low" ? "Low" : "Out"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <Progress value={usagePercent} className="h-2" />
                        <p className="mt-1 text-[10px] text-muted-foreground">{usagePercent.toFixed(0)}% reserved</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
