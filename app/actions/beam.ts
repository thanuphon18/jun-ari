"use server"

import axios, { isAxiosError } from "axios"
import { randomUUID } from "crypto"
import {
  attachBeamPaymentLinkToOrder,
  insertPendingBeamPaymentLinkOrder,
} from "@/lib/beam/payment-link-webhook"
import { createClient } from "@/lib/supabase/server"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface BeamPaymentLinkResult {
  success: boolean
  url: string | null
  paymentLinkId?: string
  error?: string
}

const SHIPPING_METHODS: Record<string, { cost: number; name: string }> = {
  thaipost: { cost: 50, name: "Thailand Post (3-5 days)" },
  flash: { cost: 70, name: "Flash Express (1-2 days)" },
  kerry: { cost: 80, name: "Kerry Express (1-2 days)" },
  jt: { cost: 65, name: "J&T Express (2-3 days)" },
  dhl: { cost: 150, name: "DHL Express (Next day)" },
}

function toMinorUnit(amount: number) {
  return Math.round(amount * 100)
}

/** Default payment methods for hosted checkout (Beam payment-links shape). */
const BEAM_LINK_SETTINGS = {
  buyNowPayLater: { isEnabled: false },
  card: { isEnabled: true },
  cardInstallments: {
    installments3m: { isEnabled: false },
    installments4m: { isEnabled: false },
    installments6m: { isEnabled: false },
    installments10m: { isEnabled: false },
    isEnabled: false,
  },
  eWallets: { isEnabled: true },
  mobileBanking: { isEnabled: true },
  qrPromptPay: { isEnabled: true },
} as const

const PAYMENT_LINK_TTL_MS = 24 * 60 * 60 * 1000

function hasCompleteCheckoutShippingAddress(addr: Record<string, string>): boolean {
  return ["full_name", "phone", "address", "district", "province", "postal_code"].every(
    (k) => addr[k]?.trim().length
  )
}

function buildBeamOrderPayload(
  cartItems: CartItem[],
  params: {
    referenceId: string
    redirectUrl: string
    customerEmail?: string
    shippingMethod: string
    shippingLabel: string
    finalShippingCost: number
    total: number
    shippingAddress: Record<string, string> | null
  }
) {
  const orderItems = cartItems.map((item) => {
    const line: Record<string, string | number> = {
      description: item.name.slice(0, 500),
      itemName: item.name.slice(0, 500),
      price: toMinorUnit(item.price),
      productId: item.id.slice(0, 200),
      quantity: item.quantity,
      sku: item.id.slice(0, 100),
    }
  
      if(item.image_url?.includes('https://')) {
        line.imageUrl = item.image_url
      } else if(item.image_url) {
        line.imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}${item.image_url}`
      }
    
    return line
  })

  if (params.finalShippingCost > 0) {
    orderItems.push({
      description: params.shippingLabel,
      itemName: `Shipping — ${params.shippingLabel}`,
      price: toMinorUnit(params.finalShippingCost),
      productId: "shipping",
      quantity: 1,
      sku: "SHIPPING",
    })
  }

  const summary = cartItems.map((i) => `${i.name} x${i.quantity}`).join(", ")
  const internalBits = [params.customerEmail, params.shippingMethod].filter(Boolean)

  const skipBeamAddress = hasCompleteCheckoutShippingAddress(params.shippingAddress ?? {})

  return {
    collectDeliveryAddress: !skipBeamAddress,
    collectPhoneNumber: false,
    expiresAt: new Date(Date.now() + PAYMENT_LINK_TTL_MS).toISOString(),
    linkSettings: BEAM_LINK_SETTINGS,
    order: {
      currency: "THB" as const,
      description: `Order payment (${summary.slice(0, 180)})`,
      internalNote: internalBits.join(" · ").slice(0, 500) || undefined,
      netAmount: toMinorUnit(params.total),
      orderItems,
      referenceId: params.referenceId,
    },
    redirectUrl: params.redirectUrl,
    feeType: "TRANSACTION_FEE" as const,
  }
}

export async function createBeamPaymentLink(
  cartItems: CartItem[],
  customerEmail?: string,
  shippingMethod = "thaipost",
  guestUserId?: string,
  shippingAddress: Record<string, string> | null = null
): Promise<BeamPaymentLinkResult> {
  try {
    const beamBaseUrl = process.env.BEAM_BASE_URL
    const beamSecretKey = process.env.BEAM_SECRET_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const beamMerchantId = process.env.BEAM_MERCHANT_ID

    if (!beamSecretKey) {
      return { success: false, url: null, error: "Missing BEAM_SECRET_KEY" }
    }
    if (!cartItems?.length) {
      return { success: false, url: null, error: "Cart is empty" }
    }
    if (!shippingAddress || !hasCompleteCheckoutShippingAddress(shippingAddress)) {
      return { success: false, url: null, error: "Delivery address is incomplete" }
    }

    if (!beamMerchantId) {
      return { success: false, url: null, error: "Missing BEAM_MERCHANT_ID" }
    }
    const basicCredentials = Buffer.from(`${beamMerchantId}:${beamSecretKey}`).toString("base64")

    const shipping = SHIPPING_METHODS[shippingMethod] ?? SHIPPING_METHODS.thaipost
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const finalShippingCost = subtotal >= 2000 ? 0 : shipping.cost
    const total = subtotal + finalShippingCost
    const referenceId = `order_${Date.now()}`
    const redirectUrl = `${appUrl}/checkout/success?reference_id=${encodeURIComponent(referenceId)}`

    const payload = buildBeamOrderPayload(cartItems, {
      referenceId,
      redirectUrl,
      customerEmail,
      shippingMethod,
      shippingLabel: shipping.name,
      finalShippingCost,
      total,
      shippingAddress,
    })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const pendingOrder = await insertPendingBeamPaymentLinkOrder(supabase, {
      referenceId,
      userId: user?.id ?? null,
      guestUserId: user?.id ? null : guestUserId?.trim() || null,
      customerEmail: customerEmail?.trim() || null,
      shippingMethod,
      shippingCost: finalShippingCost,
      totalAmount: total,
      shippingAddress,
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
    if (!pendingOrder.ok) {
      return { success: false, url: null, error: pendingOrder.message }
    }

    const { data } = await axios.post<{ url?: string; id?: string }>(
      `${beamBaseUrl}/api/v1/payment-links`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicCredentials}`,
          "x-beam-idempotency-key": randomUUID(),
        },
      }
    )

    const paymentLinkId = data.id
    if (paymentLinkId) {
      const attached = await attachBeamPaymentLinkToOrder(supabase, {
        orderId: pendingOrder.orderId,
        paymentLinkId,
      })
      if (!attached.ok) {
        console.error("[beam] attach payment link to order:", attached.message)
      }
    }

    return {
      success: true,
      url: data.url ?? null,
      paymentLinkId,
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const body = error.response.data
      const text =
        typeof body === "string" ? body : body != null ? JSON.stringify(body) : ""
      return {
        success: false,
        url: null,
        error: `Beam API error (${error.response.status}): ${text || "Unknown error"}`,
      }
    }
    return {
      success: false,
      url: null,
      error: error instanceof Error ? error.message : "Failed to create Beam payment link",
    }
  }
}
