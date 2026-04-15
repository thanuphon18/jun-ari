"use client"

import { useState } from "react"
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBeamPaymentLink, type CartItem } from "@/app/actions/beam"
import { useAuth } from "@/lib/auth-context"
import {
  deliveryAddressToRecord,
  isDeliveryAddressComplete,
  useCart,
} from "@/lib/cart-context"

interface CheckoutFormProps {
  cartItems: CartItem[]
  customerEmail?: string
  shippingMethod?: string
}

const GUEST_USER_ID_STORAGE_KEY = "junari-guest-user-id"

function getOrCreateGuestUserId() {
  const existing = localStorage.getItem(GUEST_USER_ID_STORAGE_KEY)?.trim()
  if (existing) return existing

  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? `guest_${crypto.randomUUID()}`
      : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  localStorage.setItem(GUEST_USER_ID_STORAGE_KEY, generated)
  return generated
}

export function CheckoutForm({ cartItems, customerEmail, shippingMethod }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { deliveryAddress } = useCart()
  const addressComplete = isDeliveryAddressComplete(deliveryAddress)
  const shippingAddressRecord = deliveryAddressToRecord(deliveryAddress)

  const handleCheckout = async () => {
    if (!isDeliveryAddressComplete(deliveryAddress)) {
      setError("Please complete the delivery address above before continuing.")
      return
    }
    setError(null)
    setIsLoading(true)

    const guestUserId = user?.id ? undefined : getOrCreateGuestUserId()
    const result = await createBeamPaymentLink(
      cartItems,
      customerEmail,
      shippingMethod,
      guestUserId,
      shippingAddressRecord
    )

    if (!result.success || !result.url) {
      setError(result.error || "Failed to create payment link")
      setIsLoading(false)
      return
    }

    window.location.href = result.url
  }

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
    <div id="checkout" className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You will be redirected to Beam&apos;s secure hosted checkout page.
      </p>
      {!addressComplete && (
        <p className="text-sm text-muted-foreground">
          Complete all delivery address fields above to enable payment.
        </p>
      )}
      <Button
        onClick={handleCheckout}
        disabled={isLoading || !addressComplete}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            Pay with Beam
            <ExternalLink className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
