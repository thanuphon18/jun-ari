"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import type { DiscountCode } from "@/lib/types"
import { createDiscountCode, toggleDiscountCode } from "@/lib/actions"
import { toast } from "sonner"
import { Plus, Tag, Zap } from "lucide-react"

export function AdminPromotionsClient({ discountCodes }: { discountCodes: DiscountCode[] }) {
  const [showCreate, setShowCreate] = useState(false)

  const handleToggle = async (id: string, isActive: boolean) => {
    const result = await toggleDiscountCode(id, isActive)
    if (result.success) toast.success("Discount code status toggled")
    else toast.error(result.error)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Promotions</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Discount Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4 py-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const result = await createDiscountCode({
                  code: (fd.get("code") as string).toUpperCase(),
                  discount_type: fd.get("type") as "percentage" | "fixed",
                  discount_value: parseFloat(fd.get("value") as string),
                  max_uses: fd.get("max_uses") ? parseInt(fd.get("max_uses") as string) : undefined,
                  valid_until: (fd.get("valid_until") as string) || undefined,
                })
                if (result.success) {
                  toast.success("Discount code created!")
                  setShowCreate(false)
                } else {
                  toast.error(result.error)
                }
              }}
            >
              <div className="flex flex-col gap-2">
                <Label>Code</Label>
                <Input name="code" placeholder="e.g. SUMMER25" className="uppercase" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select name="type" defaultValue="percentage">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Value</Label>
                  <Input name="value" type="number" step="0.01" placeholder="e.g. 10" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Usage Limit</Label>
                  <Input name="max_uses" type="number" placeholder="e.g. 500" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Expires</Label>
                  <Input name="valid_until" type="date" />
                </div>
              </div>
              <Button type="submit">Create Code</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4" /> Discount Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map(dc => {
                const usagePercent = dc.max_uses ? Math.round((dc.current_uses / dc.max_uses) * 100) : 0
                const isExpired = dc.valid_until ? new Date(dc.valid_until) < new Date() : false
                return (
                  <TableRow key={dc.id}>
                    <TableCell className="font-mono font-bold text-foreground">{dc.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{dc.discount_type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {dc.discount_type === "percentage" ? `${dc.discount_value}%` : `$${dc.discount_value}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dc.current_uses} / {dc.max_uses ?? "Unlimited"}
                    </TableCell>
                    <TableCell>
                      {dc.max_uses ? (
                        <div className="flex items-center gap-2">
                          <Progress value={usagePercent} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{usagePercent}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{dc.valid_until ? new Date(dc.valid_until).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="secondary" className="text-destructive">Expired</Badge>
                      ) : dc.is_active ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={dc.is_active}
                        onCheckedChange={(checked) => handleToggle(dc.id, checked)}
                        disabled={isExpired}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              {discountCodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No discount codes yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Points Multiplier - kept as demo for now */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" /> Points Multiplier Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-foreground">2x Points Weekend</p>
                <p className="text-sm text-muted-foreground">All B2B orders earn double loyalty points</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-muted-foreground">Mar 8-9, 2026</Badge>
                <Switch defaultChecked onCheckedChange={() => toast.success("Multiplier toggled")} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-foreground">3x Points on Supplements</p>
                <p className="text-sm text-muted-foreground">Triple points on all supplement category purchases</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-muted-foreground">Mar 15-31, 2026</Badge>
                <Switch onCheckedChange={() => toast.success("Multiplier toggled")} />
              </div>
            </div>
            <Button variant="outline" className="w-fit" onClick={() => toast.success("Event created (demo)")}>
              <Plus className="mr-1 h-4 w-4" /> Add Multiplier Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
