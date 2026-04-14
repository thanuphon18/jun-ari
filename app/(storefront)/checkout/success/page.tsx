"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { useEffect } from "react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const referenceId = searchParams.get("reference_id")
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

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
                <p className="font-medium">{referenceId}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Payment status</p>
              <p className="font-medium text-primary">Pending confirmation</p>
            </div>
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
