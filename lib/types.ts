// Database types matching our Supabase schema

export interface Profile {
  id: string
  email: string
  full_name: string
  role: "customer" | "distributor" | "admin"
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DistributorProfile {
  id: string
  company_name: string
  tier: "bronze" | "silver" | "gold" | "platinum"
  credit_limit: number
  wallet_balance: number
  total_points: number
  tax_id: string | null
  shipping_address: Record<string, string> | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: string
  image_url: string | null
  base_price: number
  is_active: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  name: string
  price: number
  cost: number
  weight_grams: number | null
  attributes: Record<string, string>
  is_active: boolean
  created_at: string
}

export interface InventoryRecord {
  id: string
  variant_id: string
  warehouse: string
  qty_on_hand: number
  qty_reserved: number
  reorder_level: number
  reorder_qty: number
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  channel: "b2c" | "b2b"
  status: OrderStatus
  payment_status: "unpaid" | "paid" | "partial" | "refunded"
  subtotal: number
  discount_amount: number
  tax_amount: number
  shipping_amount: number
  total: number
  shipping_address: Record<string, string> | null
  billing_address: Record<string, string> | null
  po_number: string | null
  notes: string | null
  discount_code_id: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  product_name: string
  variant_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface PointsLedgerEntry {
  id: string
  user_id: string
  order_id: string | null
  points: number
  type: "earned" | "redeemed" | "adjusted" | "expired"
  description: string | null
  created_at: string
}

export interface DiscountCode {
  id: string
  code: string
  description: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  current_uses: number
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
}

export interface StockAdjustment {
  id: string
  variant_id: string
  adjusted_by: string
  previous_qty: number
  new_qty: number
  reason: string
  created_at: string
}

// Joined types for convenience
export interface ProductWithVariants extends Product {
  product_variants: (ProductVariant & { inventory: InventoryRecord[] })[]
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
  profiles?: Profile
}

export interface ProductCategory {
  id: string
  name: string
}