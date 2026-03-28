"use client"

import { useState, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { createCheckoutSession, type CartItem } from "@/app/actions/stripe"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface CheckoutFormProps {
  cartItems: CartItem[]
  customerEmail?: string
  shippingMethod?: string
}

export function CheckoutForm({ cartItems, customerEmail, shippingMethod }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const result = await createCheckoutSession(cartItems, customerEmail, shippingMethod)
    
    if (result.error || !result.clientSecret) {
      setError(result.error || "Failed to initialize checkout")
      throw new Error(result.error || "Failed to initialize checkout")
    }
    
    return result.clientSecret
  }, [cartItems, customerEmail, shippingMethod])

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="text-primary underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" className="min-h-[400px]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
