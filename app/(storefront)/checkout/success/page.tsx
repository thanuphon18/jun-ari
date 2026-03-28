"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { getCheckoutSession } from "@/app/actions/stripe"

interface OrderDetails {
  id: string
  status: string
  payment_status: string
  customer_email?: string
  amount_total: number
  currency: string
  shipping_details?: {
    name?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  }
  metadata?: {
    shipping_method?: string
  }
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      if (!sessionId) {
        setError("No session ID found")
        setLoading(false)
        return
      }

      const result = await getCheckoutSession(sessionId)
      
      if (result.success && result.session) {
        setOrder(result.session as OrderDetails)
        // Clear the cart after successful payment
        clearCart()
      } else {
        setError("Failed to load order details")
      }
      
      setLoading(false)
    }

    loadOrder()
  }, [sessionId, clearCart])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
        <p className="text-destructive mb-4">{error || "Order not found"}</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

  const shippingMethodNames: Record<string, string> = {
    thaipost: "Thailand Post",
    flash: "Flash Express",
    kerry: "Kerry Express",
    jt: "J&T Express",
    dhl: "DHL Express",
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-2">
          Thank you for your order!
        </h1>
        <p className="text-muted-foreground">
          Your payment was successful. We&apos;ll send you a confirmation email shortly.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6 space-y-6">
          {/* Order Total */}
          <div className="text-center pb-6 border-b">
            <p className="text-sm text-muted-foreground mb-1">Order Total</p>
            <p className="text-3xl font-bold text-foreground">
              ฿{order.amount_total.toLocaleString()}
            </p>
          </div>

          {/* Order Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            {order.customer_email && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
              <p className="font-medium capitalize text-primary">{order.payment_status}</p>
            </div>

            {order.metadata?.shipping_method && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shipping Method</p>
                <p className="font-medium">
                  {shippingMethodNames[order.metadata.shipping_method] || order.metadata.shipping_method}
                </p>
              </div>
            )}

            {order.shipping_details?.address && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                <p className="font-medium">
                  {order.shipping_details.name}<br />
                  {order.shipping_details.address.line1}<br />
                  {order.shipping_details.address.line2 && (
                    <>{order.shipping_details.address.line2}<br /></>
                  )}
                  {order.shipping_details.address.city}, {order.shipping_details.address.state} {order.shipping_details.address.postal_code}<br />
                  {order.shipping_details.address.country}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">What&apos;s next?</p>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;re preparing your order for shipment. You&apos;ll receive tracking information via email once your package is on its way.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </main>
  )
}
