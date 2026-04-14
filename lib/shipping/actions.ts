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
      shipping_carrier: carrierId,
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
