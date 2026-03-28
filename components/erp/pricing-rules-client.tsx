"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Tag } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createPricingRule } from "@/lib/erp/actions"
import { formatDate } from "@/lib/erp/format"
import type { PricingRule } from "@/lib/erp/types"

export function PricingRulesClient({ rules }: { rules: PricingRule[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await createPricingRule({
      name: fd.get("name") as string,
      applicable_for: fd.get("applicable_for") as string,
      applicable_value: (fd.get("applicable_value") as string) || undefined,
      min_qty: Number(fd.get("min_qty")) || 1,
      max_qty: Number(fd.get("max_qty")) || undefined,
      discount_percentage: Number(fd.get("discount_percentage")) || undefined,
      rate: Number(fd.get("rate")) || undefined,
      priority: Number(fd.get("priority")) || 10,
      valid_from: (fd.get("valid_from") as string) || undefined,
      valid_until: (fd.get("valid_until") as string) || undefined,
    })
    if (result.success) {
      toast.success("Pricing rule created")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{rules.length} rules configured</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Pricing Rule</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="name">Rule Name</Label><Input id="name" name="name" required placeholder="e.g. Wholesale 10% off" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Applicable For</Label><Select name="applicable_for" defaultValue="Customer Group"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Customer Group">Customer Group</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label htmlFor="applicable_value">Value</Label><Input id="applicable_value" name="applicable_value" placeholder="e.g. Wholesale" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="min_qty">Min Qty</Label><Input id="min_qty" name="min_qty" type="number" defaultValue="1" /></div>
                <div className="grid gap-2"><Label htmlFor="max_qty">Max Qty</Label><Input id="max_qty" name="max_qty" type="number" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="discount_percentage">Discount %</Label><Input id="discount_percentage" name="discount_percentage" type="number" step="0.01" /></div>
                <div className="grid gap-2"><Label htmlFor="rate">Fixed Rate</Label><Input id="rate" name="rate" type="number" step="0.01" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="valid_from">Valid From</Label><Input id="valid_from" name="valid_from" type="date" /></div>
                <div className="grid gap-2"><Label htmlFor="valid_until">Valid Until</Label><Input id="valid_until" name="valid_until" type="date" /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="priority">Priority</Label><Input id="priority" name="priority" type="number" defaultValue="10" /></div>
              <Button type="submit">Create Rule</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Applicable For</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Qty</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    <Tag className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No pricing rules</p>
                  </TableCell>
                </TableRow>
              ) : (
                rules.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.applicable_for}</TableCell>
                    <TableCell>{r.applicable_value || "-"}</TableCell>
                    <TableCell>{r.min_qty}</TableCell>
                    <TableCell>
                      {r.discount_percentage ? `${r.discount_percentage}%` : r.discount_amount ? `$${r.discount_amount}` : r.rate ? `Rate: $${r.rate}` : "-"}
                    </TableCell>
                    <TableCell>{r.priority}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {r.valid_from ? formatDate(r.valid_from) : "..."} - {r.valid_until ? formatDate(r.valid_until) : "..."}
                    </TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></TableCell>
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
