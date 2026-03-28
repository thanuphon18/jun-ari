"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart, SHIPPING_OPTIONS } from "@/lib/cart-context"

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    itemCount,
    subtotal, 
    shippingCost, 
    total,
    shippingMethod,
    setShippingMethod 
  } = useCart()

  const freeShippingThreshold = 2000
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-serif text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm mb-6">Add some products to get started.</p>
        <Button asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-4">
                {/* Product Image */}
                <div className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground/30">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    ฿{item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Shipping Method Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                {SHIPPING_OPTIONS.map(option => (
                  <div key={option.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        <span className="font-medium text-sm">{option.name}</span>
                        <span className="text-xs text-muted-foreground block">{option.days}</span>
                      </Label>
                    </div>
                    <span className="text-sm font-medium">
                      {subtotal >= freeShippingThreshold ? (
                        <span className="text-primary">Free</span>
                      ) : (
                        `฿${option.rate}`
                      )}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">฿{subtotal.toLocaleString()}</span>
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
                  <span>฿{total.toLocaleString()}</span>
                </div>
              </div>

              {amountToFreeShipping > 0 && (
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Add <span className="font-semibold text-primary">฿{amountToFreeShipping.toLocaleString()}</span> more for free shipping
                  </p>
                </div>
              )}

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Secure payment with</p>
                <div className="flex justify-center gap-3 text-xs text-muted-foreground">
                  <span>Credit Card</span>
                  <span>•</span>
                  <span>PromptPay</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
