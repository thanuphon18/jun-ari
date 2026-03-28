"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, Search, ExternalLink, CheckCircle2, Clock, Box } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface OrderInfo {
  id: string
  order_number: string
  status: string
  tracking_number: string | null
  tracking_url: string | null
  shipping_carrier: string | null
  created_at: string
  shipping_address: any
}

const carrierInfo: Record<string, { name: string; nameTh: string; color: string }> = {
  thaipost: { name: "Thailand Post", nameTh: "ไปรษณีย์ไทย", color: "bg-red-100 text-red-800" },
  flash: { name: "Flash Express", nameTh: "แฟลช เอ็กซ์เพรส", color: "bg-yellow-100 text-yellow-800" },
  kerry: { name: "Kerry Express", nameTh: "เคอร์รี่ เอ็กซ์เพรส", color: "bg-orange-100 text-orange-800" },
  jt: { name: "J&T Express", nameTh: "เจแอนด์ที เอ็กซ์เพรส", color: "bg-red-100 text-red-800" },
  dhl: { name: "DHL Express", nameTh: "ดีเอชแอล", color: "bg-yellow-100 text-yellow-800" },
}

const statusSteps = [
  { key: "pending", label: "Order Placed", labelTh: "สั่งซื้อแล้ว", icon: Box },
  { key: "confirmed", label: "Confirmed", labelTh: "ยืนยันแล้ว", icon: CheckCircle2 },
  { key: "processing", label: "Processing", labelTh: "กำลังจัดเตรียม", icon: Clock },
  { key: "shipped", label: "Shipped", labelTh: "จัดส่งแล้ว", icon: Truck },
  { key: "delivered", label: "Delivered", labelTh: "จัดส่งสำเร็จ", icon: MapPin },
]

export default function TrackOrderPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError("")
    setOrder(null)

    const supabase = createClient()
    
    // Search by order number or tracking number
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number, status, tracking_number, tracking_url, shipping_carrier, created_at, shipping_address")
      .or(`order_number.ilike.%${searchQuery}%,tracking_number.ilike.%${searchQuery}%`)
      .single()

    if (fetchError || !data) {
      setError("Order not found. Please check your order number or tracking number.")
    } else {
      setOrder(data)
    }
    
    setLoading(false)
  }

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status)
  }

  const carrier = order?.shipping_carrier ? carrierInfo[order.shipping_carrier] : null

  return (
    <div className="min-h-[60vh] py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Package className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-serif mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">ติดตามพัสดุของคุณ</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Enter order number or tracking number / ใส่เลขที่คำสั่งซื้อหรือเลขพัสดุ"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Track"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Order Results */}
        {order && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order {order.order_number}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Status Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(order.status)
                      const isCompleted = index <= currentIndex
                      const isCurrent = index === currentIndex
                      const StepIcon = step.icon
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center mb-2
                            ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                            ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                          `}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs text-center ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{step.labelTh}</span>
                          {index < statusSteps.length - 1 && (
                            <div className={`
                              absolute h-0.5 w-full top-5 left-1/2
                              ${index < currentIndex ? "bg-primary" : "bg-muted"}
                            `} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Shipping Info */}
                {order.tracking_number && carrier && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Information / ข้อมูลการจัดส่ง
                    </h3>
                    
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Carrier / ขนส่ง</p>
                          <p className="font-medium">{carrier.name}</p>
                          <p className="text-sm text-muted-foreground">{carrier.nameTh}</p>
                        </div>
                        <Badge className={carrier.color}>{carrier.name}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Tracking Number / เลขพัสดุ</p>
                          <p className="font-mono font-medium text-lg">{order.tracking_number}</p>
                        </div>
                        {order.tracking_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              Track on {carrier.name}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* No tracking yet */}
                {!order.tracking_number && order.status !== "delivered" && (
                  <div className="border-t pt-6 text-center text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tracking information will be available once your order ships.</p>
                    <p className="text-sm">ข้อมูลการติดตามจะปรากฏเมื่อจัดส่งสินค้าแล้ว</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address / ที่อยู่จัดส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at contact@jun-ari.com</p>
          <p>ต้องการความช่วยเหลือ? ติดต่อเราที่ contact@jun-ari.com</p>
        </div>
      </div>
    </div>
  )
}
