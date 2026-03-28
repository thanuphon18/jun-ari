"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Package } from "lucide-react"
import { formatCurrency, formatQty } from "@/lib/erp/format"

interface StockBalanceRow {
  variant_id: string; warehouse_id: string; sku: string; item_name: string;
  warehouse_name: string; qty: number; valuation_rate: number; value: number
}

export function StockBalanceClient({ balances }: { balances: StockBalanceRow[] }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return balances.filter(b =>
      b.sku.toLowerCase().includes(search.toLowerCase()) ||
      b.item_name.toLowerCase().includes(search.toLowerCase()) ||
      b.warehouse_name.toLowerCase().includes(search.toLowerCase())
    )
  }, [balances, search])

  const totalValue = filtered.reduce((s, b) => s + b.value, 0)
  const totalQty = filtered.reduce((s, b) => s + b.qty, 0)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Items</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{balances.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Qty</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatQty(totalQty)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Value</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by SKU, item, or warehouse..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No stock balance data</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(b => (
                  <TableRow key={`${b.variant_id}-${b.warehouse_id}`}>
                    <TableCell className="font-mono text-sm">{b.sku}</TableCell>
                    <TableCell className="font-medium">{b.item_name}</TableCell>
                    <TableCell>{b.warehouse_name}</TableCell>
                    <TableCell className="text-right font-mono">{formatQty(b.qty)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(b.valuation_rate)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(b.value)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {filtered.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatQty(totalQty)}</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(totalValue)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
