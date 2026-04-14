"use server"

import { createClient } from "@/lib/supabase/server"

export interface ShippingCarrier {
  id: string
  name: string
  name_th: string | null
  logo_url: string | null
  tracking_url_template: string | null
  base_rate: number
  estimated_days: string | null
  is_active: boolean
  position: number
}

export interface Order {
  id: string
  user_id?: string | null
  guest_user_id?: string | null
  payment_provider?: string | null
  external_payment_id?: string | null
  status: string
  total: number
  currency?: string | null
  customer_email?: string | null
  shipping_address: {
    address: string
    city: string
    province: string
    postal_code: string
    country: string
  } | null
  shipping_amount: number
  shipping_carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export async function getShippingCarriers(): Promise<ShippingCarrier[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("shipping_carriers")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true })

  if (error) {
    console.error("Error fetching shipping carriers:", error)
    return []
  }

  return data || []
}

export async function getOrders(status?: string): Promise<Order[]> {
  const supabase = await createClient()
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data || []
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()

  if (orderError || !order) {
    console.error("Error fetching order:", orderError)
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
  }

  return { ...order, items: items || [] }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user orders:", error)
    return []
  }

  return data || []
}

export async function getShippingRate(carrierId: string, weight?: number): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("shipping_carriers")
    .select("base_rate")
    .eq("id", carrierId)
    .single()

  if (error || !data) {
    return 50 // Default fallback rate
  }

  // Simple weight-based calculation (can be enhanced)
  const baseRate = data.base_rate
  const weightMultiplier = weight ? Math.ceil(weight / 1000) : 1
  
  return baseRate * weightMultiplier
}

export function getTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string {
  if (!carrier.tracking_url_template || !trackingNumber) {
    return ""
  }
  return carrier.tracking_url_template.replace("{tracking}", trackingNumber)
}
