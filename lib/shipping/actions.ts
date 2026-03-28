"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/orders")
  return { success: true }
}

export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string,
  carrierId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Get carrier info for tracking URL
  const { data: carrier } = await supabase
    .from("shipping_carriers")
    .select("tracking_url_template")
    .eq("id", carrierId)
    .single()

  const trackingUrl = carrier?.tracking_url_template
    ? carrier.tracking_url_template.replace("{tracking}", trackingNumber)
    : null

  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      shipping_method: carrierId,
      status: "shipped",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) {
    console.error("Error updating tracking:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/orders")
  return { success: true }
}

export async function createOrder(orderData: {
  userId?: string
  stripeSessionId: string
  totalAmount: number
  customerEmail: string
  customerName: string
  customerPhone?: string
  shippingAddress: {
    address: string
    city: string
    province: string
    postal_code: string
    country: string
  }
  shippingMethod: string
  shippingCost: number
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }[]
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = await createClient()
  
  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: orderData.userId || null,
      stripe_session_id: orderData.stripeSessionId,
      status: "paid",
      total_amount: orderData.totalAmount,
      currency: "THB",
      customer_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone || null,
      shipping_address: orderData.shippingAddress,
      shipping_method: orderData.shippingMethod,
      shipping_cost: orderData.shippingCost,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    console.error("Error creating order:", orderError)
    return { success: false, error: orderError?.message || "Failed to create order" }
  }

  // Create order items
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    // Order was created but items failed - still return success with warning
  }

  return { success: true, orderId: order.id }
}

export async function updateShippingCarrier(
  carrierId: string,
  data: {
    name?: string
    name_th?: string
    base_rate?: number
    estimated_days?: string
    is_active?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("shipping_carriers")
    .update(data)
    .eq("id", carrierId)

  if (error) {
    console.error("Error updating shipping carrier:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/shipping")
  return { success: true }
}
