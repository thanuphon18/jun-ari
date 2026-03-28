"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Package } from "lucide-react"
import { formatDate, formatCurrency, formatQty } from "@/lib/erp/format"
import type { StockLedgerEntry, Warehouse } from "@/lib/erp/types"

export function StockLedgerClient({ entries, warehouses }: { entries: StockLedgerEntry[]; warehouses: Warehouse[] }) {
  const [warehouseFilter, setWarehouseFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchWarehouse = warehouseFilter === "all" || e.warehouse_id === warehouseFilter
      const matchSearch = !search ||
        e.product_variants?.sku?.toLowerCase().includes(search.toLowerCase()) ||
        e.product_variants?.name?.toLowerCase().includes(search.toLowerCase())
      return matchWarehouse && matchSearch
    })
  }, [entries, warehouseFilter, search])

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2">
          <Label className="text-xs">Warehouse</Label>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by SKU or item..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Qty Change</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Qty After</TableHead>
                <TableHead>Voucher</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No stock ledger entries</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground">{formatDate(e.posting_date)}</TableCell>
                    <TableCell className="font-mono text-sm">{e.product_variants?.sku}</TableCell>
                    <TableCell>{e.product_variants?.name}</TableCell>
                    <TableCell>{e.warehouses?.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={Number(e.qty_change) > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>
                        {Number(e.qty_change) > 0 ? "+" : ""}{formatQty(e.qty_change)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(e.valuation_rate)}</TableCell>
                    <TableCell className="text-right font-mono">{formatQty(e.qty_after_transaction)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.voucher_type}</TableCell>
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
