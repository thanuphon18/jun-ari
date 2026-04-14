"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OrderStatusBadge } from "@/components/order-status-badge"
import type { OrderWithItems, OrderStatus } from "@/lib/types"
import { updateOrderStatus, updateOrderTracking } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Download, Truck, Package, ExternalLink } from "lucide-react"

const statusFilters: ("all" | OrderStatus)[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "returned"]

interface ShippingCarrier {
  id: string
  name: string
  name_th: string | null
  base_rate: number
  estimated_days: string | null
}

export function AdminOrdersClient({ orders }: { orders: OrderWithItems[] }) {
  const [filter, setFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState("")
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([])
  
  // Shipping dialog state
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchCarriers()
  }, [])

  async function fetchCarriers() {
    const supabase = createClient()
    const { data } = await supabase
      .from("shipping_carriers")
      .select("*")
      .eq("is_active", true)
      .order("position")
  
    if (data) setCarriers(data)
  }


  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(o => o.id)))
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return
    const promises = Array.from(selected).map(id => updateOrderStatus(id, bulkAction))
    await Promise.all(promises)
    toast.success(`Updated ${selected.size} orders to "${bulkAction}"`)
    setSelected(new Set())
    setBulkAction("")
  }

  const openShippingDialog = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setTrackingNumber(order.tracking_number || "")
    setSelectedCarrier(order.shipping_carrier || "thaipost")
    setShippingDialogOpen(true)
  }

  const handleUpdateTracking = async () => {
    if (!selectedOrder || !trackingNumber || !selectedCarrier) return
    
    setIsUpdating(true)
    try {
      await updateOrderTracking(selectedOrder.id, trackingNumber, selectedCarrier)
      toast.success("Tracking information updated successfully")
      setShippingDialogOpen(false)
      // Refresh would happen via revalidation
      window.location.reload()
    } catch (error) {
      toast.error("Failed to update tracking information")
    } finally {
      setIsUpdating(false)
    }
  }

  const getCarrierName = (carrierId: string) => {
    const carrier = carriers.find(c => c.id === carrierId)
    return carrier ? carrier.name : carrierId
  }

  const getTrackingUrl = (carrierId: string, trackingNumber: string) => {
    const trackingUrls: Record<string, string> = {
      thaipost: `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`,
      flash: `https://www.flashexpress.co.th/tracking/?se=${trackingNumber}`,
      kerry: `https://th.kerryexpress.com/th/track/?track=${trackingNumber}`,
      jt: `https://www.jtexpress.co.th/trajectoryQuery?waybillNo=${trackingNumber}`,
      dhl: `https://www.dhl.com/th-th/home/tracking.html?tracking-id=${trackingNumber}`,
    }
    return trackingUrls[carrierId] || "#"
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Order Management</h2>
        <Button variant="outline" size="sm" onClick={() => toast.success("CSV exported (demo)")}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Shipping Carriers Info */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {carriers.map(carrier => (
          <Card key={carrier.id} className="p-3">
            <div className="text-sm font-medium">{carrier.name}</div>
            <div className="text-xs text-muted-foreground">{carrier.name_th}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Base: ฿{carrier.base_rate} | {carrier.estimated_days}
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="flex-wrap">
          {statusFilters.map(s => (
            <TabsTrigger key={s} value={s} className="capitalize">{s === "all" ? "All" : s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm text-foreground">{selected.size} selected</span>
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Bulk action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Mark Confirmed</SelectItem>
              <SelectItem value="processing">Mark Processing</SelectItem>
              <SelectItem value="shipped">Mark Shipped</SelectItem>
              <SelectItem value="delivered">Mark Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction}>Apply</Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(order => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(order.id)}
                      onCheckedChange={() => toggleSelect(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">{order.order_number}</Link>
                  </TableCell>
                  <TableCell className="text-foreground">{order.profiles?.full_name ?? "Unknown"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.shipping_carrier && (
                        <span className="text-muted-foreground">{getCarrierName(order.shipping_carrier)}</span>
                      )}
                      {order.tracking_number && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">{order.tracking_number}</span>
                          <a
                            href={getTrackingUrl(order.shipping_carrier || "thaipost", order.tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">฿{Number(order.total).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShippingDialog(order)}
                      title="Update Shipping"
                    >
                      <Truck className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shipping Dialog */}
      <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Update Shipping Information
            </DialogTitle>
            <DialogDescription>
              Order: {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Shipping Carrier / ขนส่ง</Label>
              <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map(carrier => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      <div className="flex items-center gap-2">
                        <span>{carrier.name}</span>
                        <span className="text-muted-foreground">({carrier.name_th})</span>
                        <span className="text-xs text-muted-foreground">- ฿{carrier.base_rate}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tracking Number / เลขพัสดุ</Label>
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            {trackingNumber && selectedCarrier && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Preview Tracking URL:</p>
                <a
                  href={getTrackingUrl(selectedCarrier, trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all text-xs"
                >
                  {getTrackingUrl(selectedCarrier, trackingNumber)}
                </a>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTracking} 
              disabled={!trackingNumber || !selectedCarrier || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update & Mark Shipped"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
