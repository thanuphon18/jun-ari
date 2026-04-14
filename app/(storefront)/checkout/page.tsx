"use client"

import { useCart } from "@/lib/cart-context"
import { formatBahtInteger } from "@/lib/format-baht-display"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, shippingMethod, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-serif text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm mb-6">Add some products before checkout.</p>
        <Button asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    )
  }

  const cartItems = items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.image_url,
  }))

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Link 
        href="/cart" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Secure payment via Beam hosted checkout.
              </p>
            </CardHeader>
            <CardContent>
              <CheckoutForm 
                cartItems={cartItems} 
                shippingMethod={shippingMethod}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium ml-4">฿{formatBahtInteger(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">฿{formatBahtInteger(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-primary">Free</span>
                    ) : (
                      `฿${shippingCost}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>฿{formatBahtInteger(total)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
