"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/order-status-badge"
import type { OrderWithItems, OrderStatus } from "@/lib/types"
import { updateOrderStatus } from "@/lib/actions"
import { toast } from "sonner"
import { ArrowLeft, FileText, Plus } from "lucide-react"
import Link from "next/link"

const statusSteps: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"]

export function AdminOrderDetailClient({ order }: { order: OrderWithItems }) {
  const router = useRouter()
  const [status, setStatus] = useState<string>(order.status)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const currentStep = statusSteps.indexOf(order.status)
  const isB2B = order.channel === "b2b"

  const handleSave = async () => {
    setSaving(true)
    const result = await updateOrderStatus(order.id, status)
    if (result.success) {
      toast.success(`Order ${order.order_number} updated to "${status}"`)
      setNote("")
    } else {
      toast.error(result.error || "Failed to update")
    }
    setSaving(false)
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{order.order_number}</h2>
          <p className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] capitalize text-muted-foreground">{step}</span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{item.product_name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.variant_name}</TableCell>
                      <TableCell className="text-center text-foreground">{item.quantity}</TableCell>
                      <TableCell className="text-right text-foreground">${Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">${Number(item.total_price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Status Updater */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusSteps.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Add an internal note..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-foreground">{order.profiles?.full_name ?? "Unknown"}</p>
              <p className="text-muted-foreground">{order.profiles?.email ?? ""}</p>
              <p className="text-muted-foreground">{order.channel === "b2b" ? "B2B Distributor" : "Retail Customer"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {order.shipping_address ?
                Object.values(order.shipping_address).join(", ") :
                "No shipping address"
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-primary">-${Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">${Number(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">${Number(order.shipping_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</span>
              </div>
              {isB2B && order.po_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number</span>
                  <span className="text-foreground">{order.po_number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Invoice Button - for orders ready to be invoiced */}
          {(order.status === "delivered" || order.status === "processing" || order.status === "shipped") && (
            <Button asChild>
              <Link href={`/admin/selling/invoices/new?order_id=${order.id}`}>
                <Plus className="mr-1 h-4 w-4" /> Create Sales Invoice
              </Link>
            </Button>
          )}

          {isB2B && (
            <Button variant="outline" onClick={() => toast.success("Invoice downloaded (demo)")}>
              <FileText className="mr-1 h-4 w-4" /> Download Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
