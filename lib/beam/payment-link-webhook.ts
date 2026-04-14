import type { SupabaseClient } from "@supabase/supabase-js"

/** Shape of Beam `payment_link.paid` body (GET payment link response). */
export interface BeamWebhookOrderItem {
  description?: string
  imageUrl?: string
  itemName?: string
  price?: number
  productId?: string
  quantity?: number
  sku?: string
}

export interface BeamWebhookOrder {
  netAmount?: number
  currency?: string
  description?: string
  referenceId?: string
  internalNote?: string
  orderItems?: BeamWebhookOrderItem[]
}

export interface BeamPaymentLinkWebhookPayload {
  paymentLinkId?: string
  merchantId?: string
  url?: string
  status?: string
  order?: BeamWebhookOrder
  redirectUrl?: string
  expiresAt?: string
  feeType?: string
  collectDeliveryAddress?: boolean
  collectPhoneNumber?: boolean
}

export function parseBeamInternalNote(note: string | undefined): {
  customerEmail: string | null
  shippingMethod: string
} {
  if (!note?.trim()) {
    return { customerEmail: null, shippingMethod: "thaipost" }
  }
  const parts = note.split(" · ").map((s) => s.trim()).filter(Boolean)
  const first = parts[0]
  const second = parts[1]
  const customerEmail = first?.includes("@") ? first : null
  const shippingMethod = (customerEmail ? second : first) || "thaipost"
  return { customerEmail, shippingMethod }
}

function minorToMajor(minor: number) {
  return Math.round(minor) / 100
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100
}

/** Matches cart line titles like `Product - Variant`. */
function splitProductDisplayName(name: string): { product_name: string; variant_name: string } {
  const idx = name.indexOf(" - ")
  if (idx === -1) {
    return { product_name: name, variant_name: "" }
  }
  return { product_name: name.slice(0, idx).trim(), variant_name: name.slice(idx + 3).trim() }
}

export type PendingBeamOrderCartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

/**
 * Called right after Beam creates a payment link. Idempotent on `paymentLinkId`.
 * Webhook `persistBeamPaidPaymentLink` upgrades this row to `paid`.
 */
export async function insertPendingBeamPaymentLinkOrder(
  supabase: SupabaseClient,
  params: {
    referenceId: string
    userId: string | null
    guestUserId: string | null
    customerEmail: string | null
    shippingMethod: string
    shippingCost: number
    totalAmount: number
    cartItems: PendingBeamOrderCartItem[]
  }
): Promise<{ ok: true; orderId: string } | { ok: false; message: string }> {
  const {
    referenceId,
    userId,
    guestUserId,
    customerEmail,
    shippingMethod,
    shippingCost,
    totalAmount,
    cartItems,
  } = params

  const subtotal = roundMoney(cartItems.reduce((s, item) => s + item.price * item.quantity, 0))
  const shipping_amount = roundMoney(shippingCost)
  const tax_amount = 0
  const discount_amount = 0
  const total = roundMoney(totalAmount)

  const notes = [
    "Beam checkout (pending)",
    `ref:${referenceId}`,
    `ship:${shippingMethod}`,
    guestUserId ? `guest:${guestUserId}` : null,
  ]
    .filter(Boolean)
    .join(" · ")
  const order_number = `ORD-${Date.now().toString(36).toUpperCase()}`

  const { data: inserted, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number,
      user_id: userId ?? null,
      guest_user_id: guestUserId ?? null,
      channel: "b2c",
      status: "pending",
      payment_status: "unpaid",
      subtotal,
      discount_amount,
      tax_amount,
      shipping_amount,
      shipping_carrier: shippingMethod,
      tracking_number: null,
      tracking_url: null,
      total,
      shipping_address: null,
      po_number: null,
      discount_code_id: null,
      notes,
      payment_provider: "beam",
      external_payment_id: null,
      currency: "THB",
      customer_email: customerEmail,
    })
    .select("id")
    .single()

  if (orderError || !inserted?.id) {
    return { ok: false, message: orderError?.message ?? "order insert failed" }
  }

  const orderId = inserted.id as string
  const rows = cartItems.map((item) => {
    const { product_name, variant_name } = splitProductDisplayName(item.name)
    const qty = item.quantity
    const unit = roundMoney(item.price)
    return {
      order_id: orderId,
      variant_id: item.id,
      product_name,
      variant_name,
      sku: item.id,
      quantity: qty,
      unit_price: unit,
      total_price: roundMoney(unit * qty),
    }
  })

  if (rows.length > 0) {
    const { error: itemsError } = await supabase.from("order_items").insert(rows)
    if (itemsError) {
      return { ok: false, message: itemsError.message }
    }
  }

  return { ok: true, orderId }
}

export async function attachBeamPaymentLinkToOrder(
  supabase: SupabaseClient,
  params: { orderId: string; paymentLinkId: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { orderId, paymentLinkId } = params

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("external_payment_id", paymentLinkId)
    .maybeSingle()

  if (existing?.id && existing.id !== orderId) {
    return { ok: false, message: "payment link already attached to another order" }
  }

  const { error } = await supabase
    .from("orders")
    .update({ external_payment_id: paymentLinkId })
    .eq("id", orderId)

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true }
}

/**
 * Idempotent on `external_payment_id` (= Beam payment link id).
 * Amounts: major units (THB). Core columns match `placeOrder` in `lib/actions.ts`.
 */
export async function persistBeamPaidPaymentLink(
  supabase: SupabaseClient,
  payload: BeamPaymentLinkWebhookPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const paymentLinkId = payload.paymentLinkId
  const order = payload.order

  // console.log('====payload', payload)
  if (!paymentLinkId || !order) {
    return { ok: false, message: "missing paymentLinkId or order" }
  }
  if (payload.status !== "PAID") {
    return { ok: false, message: `unexpected status ${payload.status}` }
  }

  const netMinor = order.netAmount ?? 0
  const paidTotal = roundMoney(minorToMajor(netMinor))

  const { data: existing } = await supabase
    .from("orders")
    .select("id, status, payment_status")
    .eq("external_payment_id", paymentLinkId)
    .maybeSingle()

  if (existing?.id) {
    const row = existing as { id: string; status: string; payment_status?: string | null }
    if (row.payment_status === "paid" || row.status === "paid") {
      return { ok: true }
    }
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        total: paidTotal,
      })
      .eq("id", existing.id)
    if (updateError) {
      return { ok: false, message: updateError.message }
    }
    return { ok: true }
  }

  return { ok: false, message: "order not found" }
}
