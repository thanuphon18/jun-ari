"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ======================== ORDERS ========================

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin", "layout")
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin", "layout")
  return { success: true }
}

export async function updateOrderTracking(orderId: string, trackingNumber: string, carrierId: string) {
  const supabase = await createClient()
  
  // Get tracking URL template for carrier
  const trackingUrls: Record<string, string> = {
    thaipost: `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`,
    flash: `https://www.flashexpress.co.th/tracking/?se=${trackingNumber}`,
    kerry: `https://th.kerryexpress.com/th/track/?track=${trackingNumber}`,
    jt: `https://www.jtexpress.co.th/trajectoryQuery?waybillNo=${trackingNumber}`,
    dhl: `https://www.dhl.com/th-th/home/tracking.html?tracking-id=${trackingNumber}`,
  }

  const { error } = await supabase
    .from("orders")
    .update({ 
      tracking_number: trackingNumber,
      tracking_url: trackingUrls[carrierId] || null,
      shipping_carrier: carrierId,
      status: "shipped"
    })
    .eq("id", orderId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin", "layout")
  return { success: true }
}

// ======================== PRODUCTS ========================

export async function createProduct(data: {
  name: string
  slug: string
  description: string
  category: string
  base_price: number
  image_url?: string
  tags?: string[]
}) {
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/products")
  revalidatePath("/")
  return { success: true, product }
}

export async function updateProduct(id: string, data: {
  name?: string
  description?: string
  category?: string
  base_price?: number
  is_active?: boolean
  image_url?: string
  tags?: string[]
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/products")
  revalidatePath("/")
  return { success: true }
}

export async function createVariant(data: {
  product_id: string
  sku: string
  name: string
  price: number
  cost: number
  weight_grams?: number
  attributes?: Record<string, string>
}) {
  const supabase = await createClient()
  const { data: variant, error } = await supabase
    .from("product_variants")
    .insert(data)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Auto-create inventory record
  if (variant) {
    await supabase.from("inventory").insert({
      variant_id: variant.id,
      warehouse: "main",
      qty_on_hand: 0,
      qty_reserved: 0,
    })
  }

  revalidatePath("/admin/products")
  return { success: true, variant }
}

// ======================== INVENTORY ========================

export async function adjustStock(data: {
  variant_id: string
  new_qty: number
  reason: string
  adjusted_by: string
}) {
  const supabase = await createClient()

  // Get current qty
  const { data: inv } = await supabase
    .from("inventory")
    .select("qty_on_hand")
    .eq("variant_id", data.variant_id)
    .eq("warehouse", "main")
    .single()

  const previousQty = inv?.qty_on_hand ?? 0

  // Update inventory
  const { error: invError } = await supabase
    .from("inventory")
    .update({ qty_on_hand: data.new_qty })
    .eq("variant_id", data.variant_id)
    .eq("warehouse", "main")

  if (invError) return { success: false, error: invError.message }

  // Log adjustment
  const { error: adjError } = await supabase
    .from("stock_adjustments")
    .insert({
      variant_id: data.variant_id,
      adjusted_by: data.adjusted_by,
      previous_qty: previousQty,
      new_qty: data.new_qty,
      reason: data.reason,
    })

  if (adjError) return { success: false, error: adjError.message }

  revalidatePath("/admin/inventory")
  return { success: true }
}

// ======================== DISCOUNT CODES ========================

export async function createDiscountCode(data: {
  code: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount?: number
  max_uses?: number
  valid_until?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("discount_codes")
    .insert(data)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("discount_codes")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/promotions")
  return { success: true }
}

// ======================== CHECKOUT ========================

export async function placeOrder(data: {
  user_id: string
  channel: "b2c" | "b2b"
  items: { variant_id: string; product_name: string; variant_name: string; sku: string; quantity: number; unit_price: number }[]
  shipping_address: Record<string, string>
  po_number?: string
  discount_code?: string
}) {
  const supabase = await createClient()

  const subtotal = data.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const taxAmount = Math.round(subtotal * 0.08 * 100) / 100
  const shippingAmount = subtotal > 50 ? 0 : 5.99
  let discountAmount = 0
  let discountCodeId: string | null = null

  // Apply discount code if provided
  if (data.discount_code) {
    const { data: dc } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", data.discount_code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (dc) {
      if (dc.discount_type === "percentage") {
        discountAmount = Math.round(subtotal * dc.discount_value / 100 * 100) / 100
      } else {
        discountAmount = dc.discount_value
      }
      discountCodeId = dc.id

      // Increment usage
      await supabase
        .from("discount_codes")
        .update({ current_uses: dc.current_uses + 1 })
        .eq("id", dc.id)
    }
  }

  const total = Math.round((subtotal - discountAmount + taxAmount + shippingAmount) * 100) / 100

  // Generate order number
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: data.user_id,
      channel: data.channel,
      status: "pending",
      payment_status: "unpaid",
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total,
      shipping_address: data.shipping_address,
      po_number: data.po_number || null,
      discount_code_id: discountCodeId,
    })
    .select()
    .single()

  if (orderError) return { success: false, error: orderError.message }

  // Insert order items
  const orderItems = data.items.map(item => ({
    order_id: order.id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    variant_name: item.variant_name,
    sku: item.sku,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) return { success: false, error: itemsError.message }

  revalidatePath("/account")
  revalidatePath("/admin")
  return { success: true, orderNumber }
}

// ======================== PROFILE ========================

export async function updateProfile(userId: string, data: {
  full_name?: string
  phone?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/account/profile")
  return { success: true }
}

// ======================== VALIDATE DISCOUNT ========================

export async function validateDiscountCode(code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single()

  if (error || !data) return { valid: false }
  if (data.max_uses && data.current_uses >= data.max_uses) return { valid: false }
  if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false }

  return {
    valid: true,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order_amount: data.min_order_amount,
  }
}
