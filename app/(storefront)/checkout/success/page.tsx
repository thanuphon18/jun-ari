"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { isDeliveryAddressComplete, useCart } from "@/lib/cart-context"
import { getOrderStatusByPaymentReference } from "@/app/actions/checkout-success"
import { useEffect, useState } from "react"

function paymentStatusPresentation(
  loading: boolean,
  paymentStatus: string | undefined
): { label: string; hint?: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  if (loading) {
    return { label: "Checking…", hint: "Looking up your order", variant: "secondary" }
  }
  if (paymentStatus === undefined) {
    return {
      label: "Completed",
      hint: "Checkout finished successfully. Save your reference ID above for support.",
      variant: "default",
    }
  }
  switch (paymentStatus) {
    case "paid":
      return { label: "Paid", hint: "Payment received successfully", variant: "default" }
    case "partial":
      return { label: "Partially paid", variant: "secondary" }
    case "refunded":
      return { label: "Refunded", variant: "outline" }
    case "unpaid":
    default:
      return {
        label: "Confirming payment",
        hint: "Your bank may take a few seconds; we're updating your order.",
        variant: "secondary",
      }
  }
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const referenceId = searchParams.get("reference_id")
  const { clearCart, deliveryAddress } = useCart()
  const showAddress = isDeliveryAddressComplete(deliveryAddress)

  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(Boolean(referenceId))

  useEffect(() => {
    clearCart()
  }, [clearCart])

  useEffect(() => {
    if (!referenceId?.trim()) {
      setStatusLoading(false)
      return
    }

    const refId = referenceId.trim()
    let cancelled = false
    const maxPolls = 8

    async function poll() {
      for (let i = 0; i < maxPolls; i++) {
        if (cancelled) return
        let row = await getOrderStatusByPaymentReference(refId)
        if (cancelled) return
        if (!row && i === 0) {
          await new Promise((r) => setTimeout(r, 1200))
          if (cancelled) return
          row = await getOrderStatusByPaymentReference(refId)
        }
        if (cancelled) return

        setStatusLoading(false)

        if (row) {
          setPaymentStatus(row.payment_status)
          setOrderNumber(row.order_number || null)
          if (row.payment_status === "paid") return
          if (i < maxPolls - 1) await new Promise((r) => setTimeout(r, 2000))
        } else {
          setPaymentStatus(undefined)
          setOrderNumber(null)
          return
        }
      }
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [referenceId])

  const pres = paymentStatusPresentation(statusLoading, paymentStatus)

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
          Your payment has been submitted. We&apos;ll confirm your order shortly.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {referenceId && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Reference ID</p>
                <p className="font-medium font-mono text-sm break-all">{referenceId}</p>
              </div>
            )}
            {orderNumber && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Order number</p>
                <p className="font-medium">{orderNumber}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Payment status</p>
              <div className="flex flex-col gap-1.5 items-start">
                <Badge variant={pres.variant}>{pres.label}</Badge>
                {pres.hint && (
                  <p className="text-sm text-muted-foreground">{pres.hint}</p>
                )}
              </div>
            </div>
          </div>

          {showAddress && (
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-3">Delivery address</p>
              <address className="not-italic text-sm leading-relaxed space-y-0.5">
                <p className="font-medium text-foreground">{deliveryAddress.full_name}</p>
                <p className="text-muted-foreground">{deliveryAddress.phone}</p>
                <p className="text-foreground mt-2">{deliveryAddress.address}</p>
                <p className="text-foreground">
                  {deliveryAddress.district}, {deliveryAddress.province}{" "}
                  {deliveryAddress.postal_code}
                </p>
                <p className="text-foreground">{deliveryAddress.country}</p>
              </address>
            </div>
          )}

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
