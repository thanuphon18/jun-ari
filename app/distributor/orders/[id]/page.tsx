"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import useSWR from "swr"
import type { OrderWithItems, OrderStatus } from "@/lib/types"

const timelineSteps: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
]

function getStepIndex(status: OrderStatus) {
  if (status === "returned" || status === "cancelled") return 5
  const idx = timelineSteps.findIndex(s => s.key === status)
  return idx >= 0 ? idx : 0
}

export default function DistributorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()

  const { data: order, isLoading } = useSWR<OrderWithItems | null>(
    `dist-order-${id}`,
    async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single()
      return data as OrderWithItems | null
    }
  )

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!order) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Order not found. <Link href="/distributor" className="text-primary hover:underline">Go back</Link>
      </div>
    )
  }

  const currentStep = getStepIndex(order.status)

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/distributor"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">{order.order_number}</h2>
        <OrderStatusBadge status={order.status} />
        {order.po_number && (
          <Button variant="outline" size="sm" onClick={() => toast.success("PDF downloaded (demo)")}>
            <Download className="mr-1 h-4 w-4" /> Download Invoice
          </Button>
        )}
      </div>

      {/* Timeline */}
      {order.status !== "returned" && order.status !== "cancelled" && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, i) => {
                const done = i <= currentStep
                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {i > 0 && <div className={cn("h-0.5 flex-1", i <= currentStep ? "bg-primary" : "bg-border")} />}
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                        done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
                      )}>
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      {i < timelineSteps.length - 1 && <div className={cn("h-0.5 flex-1", i < currentStep ? "bg-primary" : "bg-border")} />}
                    </div>
                    <span className={cn("mt-2 text-xs", done ? "font-medium text-foreground" : "text-muted-foreground")}>{step.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">${Number(item.total_price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Order Details</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            {order.po_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">PO Number</span>
                <span className="font-medium text-foreground">{order.po_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="text-foreground capitalize">{order.payment_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${Number(order.total).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
