import { createClient } from "@/lib/supabase/server"

import type { ProductWithVariants, OrderWithItems } from "@/lib/types"

// ======================== PRODUCTS ========================

export async function getProducts(category?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("*, product_variants(*, inventory(*))")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (category && category !== "All") {
    query = query.eq("category", category)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ProductWithVariants[]
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*, inventory(*))")
    .eq("slug", slug)
    .single()

  if (error) return null
  return data as ProductWithVariants
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*, inventory(*))")
    .eq("id", id)
    .single()

  if (error) return null
  return data as ProductWithVariants
}

export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)

  if (!data) return []
  const categories = data
    .map(d => d.category)
    .filter((c): c is string => !!c)
  const unique = Array.from(new Set(categories)).map(category => ({
    id: category,
    name: category
  }))
  
  return unique.sort((a, b) => a.name.localeCompare(b.name))
}

// ======================== ORDERS ========================

export async function getOrdersByUser(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as OrderWithItems[]
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(*)")
    .eq("id", orderId)
    .single()

  if (error) return null
  return data as OrderWithItems
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(*)")
    .eq("order_number", orderNumber)
    .single()

  if (error) return null
  return data as OrderWithItems
}

// ======================== ADMIN QUERIES ========================

export async function getAllOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(full_name, email, role)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as OrderWithItems[]
}

export async function getAllProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*, inventory(*))")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ProductWithVariants[]
}

export async function getAllCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllInventory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory")
    .select("*, product_variants(*, products(name, slug))")
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllDiscountCodes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getStockAdjustments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stock_adjustments")
    .select("*, product_variants(sku, name, products(name)), profiles(full_name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPointsLedger(userId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("points_ledger")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getDistributorProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("distributor_profiles")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

// ======================== DASHBOARD KPIs ========================

export async function getAdminDashboardStats() {
  const supabase = await createClient()

  const [ordersRes, productsRes, customersRes, inventoryRes] = await Promise.all([
    supabase.from("orders").select("total, status, channel, created_at"),
    supabase.from("products").select("id").eq("is_active", true),
    supabase.from("profiles").select("id, role"),
    supabase.from("inventory").select("qty_on_hand, reorder_level"),
  ])

  const orders = ordersRes.data ?? []
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const activeProducts = (productsRes.data ?? []).length
  const customers = (customersRes.data ?? []).length
  const lowStockCount = (inventoryRes.data ?? []).filter(
    i => i.qty_on_hand <= i.reorder_level && i.qty_on_hand > 0
  ).length

  // Revenue by month (simple aggregation)
  const revenueByMonth: Record<string, number> = {}
  orders.forEach(o => {
    const month = o.created_at.slice(0, 7) // YYYY-MM
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(o.total)
  })

  // Orders by status
  const ordersByStatus: Record<string, number> = {}
  orders.forEach(o => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1
  })

  return {
    totalRevenue,
    totalOrders,
    activeProducts,
    customers,
    lowStockCount,
    revenueByMonth,
    ordersByStatus,
  }
}
