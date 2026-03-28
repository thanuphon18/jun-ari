// ============ TYPES ============
export type UserRole = "b2c" | "b2b" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface DistributorProfile {
  userId: string
  companyName: string
  taxId: string
  tier: 1 | 2 | 3
  creditWindowDays: number
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  status: "active" | "draft" | "archived"
  image: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  retailPrice: number
  b2bTier1Price: number
  b2bTier2Price: number
  b2bTier3Price: number
}

export interface Inventory {
  variantId: string
  totalStock: number
  b2bReserved: number
  b2cAvailable: number
  lowStockThreshold: number
  restockDate: string | null
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "returned"

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  paymentMethod: string
  shippingAddress: string
  createdAt: string
  poNumber: string | null
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  variantId: string
  qty: number
  unitPrice: number
}

export interface PointsLedgerEntry {
  id: string
  userId: string
  delta: number
  reason: string
  orderId: string | null
  createdAt: string
}

export interface DiscountCode {
  id: string
  code: string
  type: "percent" | "fixed" | "points"
  value: number
  usageLimit: number
  usedCount: number
  expiresAt: string
}

export interface StockAdjustment {
  id: string
  variantId: string
  delta: number
  reason: string
  operatorId: string
  createdAt: string
}

// ============ CATEGORIES ============
export const categories = ["Skincare", "Supplements", "Wellness"]

// ============ USERS ============
export const users: User[] = [
  { id: "u1", email: "alice@example.com", name: "Alice Johnson", role: "b2c", createdAt: "2025-08-15" },
  { id: "u2", email: "bob@example.com", name: "Bob Smith", role: "b2c", createdAt: "2025-09-02" },
  { id: "u3", email: "carol@example.com", name: "Carol Davis", role: "b2c", createdAt: "2025-10-11" },
  { id: "u4", email: "dave@example.com", name: "Dave Wilson", role: "b2c", createdAt: "2025-11-20" },
  { id: "u5", email: "eve@example.com", name: "Eve Martinez", role: "b2c", createdAt: "2025-12-01" },
  { id: "u6", email: "frank@greenhealth.co", name: "Frank Green", role: "b2b", createdAt: "2025-07-10" },
  { id: "u7", email: "grace@vitaplus.com", name: "Grace Lee", role: "b2b", createdAt: "2025-06-22" },
  { id: "u8", email: "henry@wellmart.com", name: "Henry Park", role: "b2b", createdAt: "2025-08-30" },
  { id: "u9", email: "admin@greenleaf.com", name: "Admin User", role: "admin", createdAt: "2025-01-01" },
]

export const distributorProfiles: DistributorProfile[] = [
  { userId: "u6", companyName: "GreenHealth Co.", taxId: "TAX-001234", tier: 1, creditWindowDays: 30 },
  { userId: "u7", companyName: "VitaPlus Inc.", taxId: "TAX-005678", tier: 2, creditWindowDays: 45 },
  { userId: "u8", companyName: "WellMart Ltd.", taxId: "TAX-009012", tier: 3, creditWindowDays: 60 },
]

// ============ PRODUCTS ============
export const products: Product[] = [
  {
    id: "p1", name: "Hydra Glow Serum", description: "Advanced hydrating serum with hyaluronic acid and vitamin C for radiant, dewy skin. Lightweight formula absorbs quickly.", category: "Skincare", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v1", productId: "p1", sku: "HGS-30", name: "30ml", retailPrice: 45, b2bTier1Price: 36, b2bTier2Price: 32, b2bTier3Price: 28 },
      { id: "v2", productId: "p1", sku: "HGS-60", name: "60ml", retailPrice: 78, b2bTier1Price: 62, b2bTier2Price: 55, b2bTier3Price: 49 },
    ],
  },
  {
    id: "p2", name: "Repair Night Cream", description: "Rich overnight repair cream with retinol and peptides. Restores skin elasticity while you sleep.", category: "Skincare", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v3", productId: "p2", sku: "RNC-50", name: "50ml", retailPrice: 62, b2bTier1Price: 50, b2bTier2Price: 44, b2bTier3Price: 39 },
    ],
  },
  {
    id: "p3", name: "Gentle Foaming Cleanser", description: "Sulfate-free foaming cleanser with green tea extract. Perfect for sensitive skin types.", category: "Skincare", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v4", productId: "p3", sku: "GFC-150", name: "150ml", retailPrice: 28, b2bTier1Price: 22, b2bTier2Price: 20, b2bTier3Price: 17 },
      { id: "v5", productId: "p3", sku: "GFC-300", name: "300ml", retailPrice: 48, b2bTier1Price: 38, b2bTier2Price: 34, b2bTier3Price: 30 },
    ],
  },
  {
    id: "p4", name: "Daily Multivitamin Complex", description: "Complete daily multivitamin with 25 essential vitamins and minerals. Supports immune and energy levels.", category: "Supplements", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v6", productId: "p4", sku: "DMC-60", name: "60 capsules", retailPrice: 35, b2bTier1Price: 28, b2bTier2Price: 25, b2bTier3Price: 22 },
      { id: "v7", productId: "p4", sku: "DMC-120", name: "120 capsules", retailPrice: 58, b2bTier1Price: 46, b2bTier2Price: 41, b2bTier3Price: 36 },
    ],
  },
  {
    id: "p5", name: "Omega-3 Fish Oil", description: "High-potency omega-3 fish oil softgels. Supports heart, brain, and joint health.", category: "Supplements", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v8", productId: "p5", sku: "OFO-90", name: "90 softgels", retailPrice: 32, b2bTier1Price: 26, b2bTier2Price: 23, b2bTier3Price: 20 },
    ],
  },
  {
    id: "p6", name: "Collagen Peptides Powder", description: "Premium grass-fed collagen peptides. Dissolves easily in hot or cold beverages for skin and joint support.", category: "Supplements", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v9", productId: "p6", sku: "CPP-250", name: "250g", retailPrice: 42, b2bTier1Price: 34, b2bTier2Price: 30, b2bTier3Price: 26 },
      { id: "v10", productId: "p6", sku: "CPP-500", name: "500g", retailPrice: 72, b2bTier1Price: 58, b2bTier2Price: 51, b2bTier3Price: 45 },
    ],
  },
  {
    id: "p7", name: "Lavender Sleep Diffuser Oil", description: "Pure lavender essential oil blend for better sleep. Works with all ultrasonic diffusers.", category: "Wellness", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v11", productId: "p7", sku: "LSD-15", name: "15ml", retailPrice: 22, b2bTier1Price: 18, b2bTier2Price: 16, b2bTier3Price: 14 },
    ],
  },
  {
    id: "p8", name: "Meditation Candle Set", description: "Hand-poured soy candles in calming scents: eucalyptus, jasmine, and sandalwood. Set of 3.", category: "Wellness", status: "active",
    image: "/placeholder-product.jpg",
    variants: [
      { id: "v12", productId: "p8", sku: "MCS-3", name: "Set of 3", retailPrice: 38, b2bTier1Price: 30, b2bTier2Price: 27, b2bTier3Price: 24 },
    ],
  },
]

// ============ INVENTORY ============
export const inventory: Inventory[] = [
  { variantId: "v1", totalStock: 250, b2bReserved: 100, b2cAvailable: 150, lowStockThreshold: 30, restockDate: null },
  { variantId: "v2", totalStock: 120, b2bReserved: 50, b2cAvailable: 70, lowStockThreshold: 20, restockDate: null },
  { variantId: "v3", totalStock: 15, b2bReserved: 5, b2cAvailable: 10, lowStockThreshold: 20, restockDate: "2026-04-01" },
  { variantId: "v4", totalStock: 300, b2bReserved: 100, b2cAvailable: 200, lowStockThreshold: 40, restockDate: null },
  { variantId: "v5", totalStock: 180, b2bReserved: 80, b2cAvailable: 100, lowStockThreshold: 25, restockDate: null },
  { variantId: "v6", totalStock: 500, b2bReserved: 200, b2cAvailable: 300, lowStockThreshold: 50, restockDate: null },
  { variantId: "v7", totalStock: 220, b2bReserved: 100, b2cAvailable: 120, lowStockThreshold: 30, restockDate: null },
  { variantId: "v8", totalStock: 0, b2bReserved: 0, b2cAvailable: 0, lowStockThreshold: 20, restockDate: "2026-03-20" },
  { variantId: "v9", totalStock: 180, b2bReserved: 80, b2cAvailable: 100, lowStockThreshold: 25, restockDate: null },
  { variantId: "v10", totalStock: 8, b2bReserved: 3, b2cAvailable: 5, lowStockThreshold: 10, restockDate: "2026-03-25" },
  { variantId: "v11", totalStock: 400, b2bReserved: 150, b2cAvailable: 250, lowStockThreshold: 50, restockDate: null },
  { variantId: "v12", totalStock: 65, b2bReserved: 25, b2cAvailable: 40, lowStockThreshold: 15, restockDate: null },
]

// ============ ORDERS ============
export const orders: Order[] = [
  {
    id: "ORD-001", userId: "u1", status: "delivered", totalAmount: 123, paymentMethod: "Credit Card", shippingAddress: "123 Oak Street, Springfield", createdAt: "2026-01-05", poNumber: null,
    items: [{ id: "oi1", orderId: "ORD-001", variantId: "v1", qty: 1, unitPrice: 45 }, { id: "oi2", orderId: "ORD-001", variantId: "v2", qty: 1, unitPrice: 78 }],
  },
  {
    id: "ORD-002", userId: "u2", status: "shipped", totalAmount: 62, paymentMethod: "Credit Card", shippingAddress: "456 Elm Ave, Portland", createdAt: "2026-02-12", poNumber: null,
    items: [{ id: "oi3", orderId: "ORD-002", variantId: "v3", qty: 1, unitPrice: 62 }],
  },
  {
    id: "ORD-003", userId: "u3", status: "confirmed", totalAmount: 76, paymentMethod: "Bank Transfer", shippingAddress: "789 Pine Road, Denver", createdAt: "2026-02-20", poNumber: null,
    items: [{ id: "oi4", orderId: "ORD-003", variantId: "v4", qty: 1, unitPrice: 28 }, { id: "oi5", orderId: "ORD-003", variantId: "v5", qty: 1, unitPrice: 48 }],
  },
  {
    id: "ORD-004", userId: "u4", status: "pending", totalAmount: 35, paymentMethod: "COD", shippingAddress: "101 Cedar Lane, Austin", createdAt: "2026-03-01", poNumber: null,
    items: [{ id: "oi6", orderId: "ORD-004", variantId: "v6", qty: 1, unitPrice: 35 }],
  },
  {
    id: "ORD-005", userId: "u5", status: "returned", totalAmount: 22, paymentMethod: "Credit Card", shippingAddress: "222 Birch Blvd, Miami", createdAt: "2026-01-18", poNumber: null,
    items: [{ id: "oi7", orderId: "ORD-005", variantId: "v11", qty: 1, unitPrice: 22 }],
  },
  {
    id: "ORD-006", userId: "u1", status: "processing", totalAmount: 90, paymentMethod: "Credit Card", shippingAddress: "123 Oak Street, Springfield", createdAt: "2026-03-02", poNumber: null,
    items: [{ id: "oi8", orderId: "ORD-006", variantId: "v1", qty: 2, unitPrice: 45 }],
  },
  {
    id: "ORD-007", userId: "u6", status: "delivered", totalAmount: 720, paymentMethod: "Bank Transfer", shippingAddress: "GreenHealth Co., 50 Commerce Way", createdAt: "2026-01-10", poNumber: "PO-GH-001",
    items: [{ id: "oi9", orderId: "ORD-007", variantId: "v1", qty: 20, unitPrice: 36 }],
  },
  {
    id: "ORD-008", userId: "u7", status: "shipped", totalAmount: 1100, paymentMethod: "Bank Transfer", shippingAddress: "VitaPlus Inc., 88 Health Street", createdAt: "2026-02-05", poNumber: "PO-VP-001",
    items: [{ id: "oi10", orderId: "ORD-008", variantId: "v6", qty: 20, unitPrice: 25 }, { id: "oi11", orderId: "ORD-008", variantId: "v9", qty: 20, unitPrice: 30 }],
  },
  {
    id: "ORD-009", userId: "u8", status: "confirmed", totalAmount: 900, paymentMethod: "Bank Transfer", shippingAddress: "WellMart Ltd., 120 Wellness Park", createdAt: "2026-02-28", poNumber: "PO-WM-001",
    items: [{ id: "oi12", orderId: "ORD-009", variantId: "v4", qty: 30, unitPrice: 17 }, { id: "oi13", orderId: "ORD-009", variantId: "v12", qty: 15, unitPrice: 24 }],
  },
  {
    id: "ORD-010", userId: "u6", status: "pending", totalAmount: 560, paymentMethod: "Bank Transfer", shippingAddress: "GreenHealth Co., 50 Commerce Way", createdAt: "2026-03-03", poNumber: "PO-GH-002",
    items: [{ id: "oi14", orderId: "ORD-010", variantId: "v3", qty: 10, unitPrice: 50 }, { id: "oi15", orderId: "ORD-010", variantId: "v11", qty: 10, unitPrice: 18 - 12 }],
  },
  {
    id: "ORD-011", userId: "u7", status: "processing", totalAmount: 640, paymentMethod: "Bank Transfer", shippingAddress: "VitaPlus Inc., 88 Health Street", createdAt: "2026-03-04", poNumber: "PO-VP-002",
    items: [{ id: "oi16", orderId: "ORD-011", variantId: "v7", qty: 10, unitPrice: 41 }, { id: "oi17", orderId: "ORD-011", variantId: "v10", qty: 5, unitPrice: 51 - 5 }],
  },
  {
    id: "ORD-012", userId: "u2", status: "delivered", totalAmount: 110, paymentMethod: "Credit Card", shippingAddress: "456 Elm Ave, Portland", createdAt: "2025-12-20", poNumber: null,
    items: [{ id: "oi18", orderId: "ORD-012", variantId: "v9", qty: 1, unitPrice: 42 }, { id: "oi19", orderId: "ORD-012", variantId: "v12", qty: 1, unitPrice: 38 }, { id: "oi20", orderId: "ORD-012", variantId: "v4", qty: 1, unitPrice: 28 }],
  },
]

// ============ POINTS LEDGER ============
export const pointsLedger: PointsLedgerEntry[] = [
  { id: "pl1", userId: "u6", delta: 500, reason: "Welcome bonus", orderId: null, createdAt: "2025-07-10" },
  { id: "pl2", userId: "u6", delta: 72, reason: "Order ORD-007 earned", orderId: "ORD-007", createdAt: "2026-01-10" },
  { id: "pl3", userId: "u6", delta: -100, reason: "Redeemed on order", orderId: "ORD-010", createdAt: "2026-03-03" },
  { id: "pl4", userId: "u7", delta: 500, reason: "Welcome bonus", orderId: null, createdAt: "2025-06-22" },
  { id: "pl5", userId: "u7", delta: 110, reason: "Order ORD-008 earned", orderId: "ORD-008", createdAt: "2026-02-05" },
  { id: "pl6", userId: "u7", delta: 64, reason: "Order ORD-011 earned", orderId: "ORD-011", createdAt: "2026-03-04" },
  { id: "pl7", userId: "u8", delta: 500, reason: "Welcome bonus", orderId: null, createdAt: "2025-08-30" },
  { id: "pl8", userId: "u8", delta: 90, reason: "Order ORD-009 earned", orderId: "ORD-009", createdAt: "2026-02-28" },
  { id: "pl9", userId: "u6", delta: -50, reason: "Expired points", orderId: null, createdAt: "2026-02-01" },
]

// ============ DISCOUNT CODES ============
export const discountCodes: DiscountCode[] = [
  { id: "dc1", code: "WELCOME10", type: "percent", value: 10, usageLimit: 1000, usedCount: 234, expiresAt: "2026-06-30" },
  { id: "dc2", code: "SAVE5", type: "fixed", value: 5, usageLimit: 500, usedCount: 89, expiresAt: "2026-04-30" },
  { id: "dc3", code: "SPRING20", type: "percent", value: 20, usageLimit: 200, usedCount: 12, expiresAt: "2026-03-31" },
  { id: "dc4", code: "B2BBONUS", type: "points", value: 200, usageLimit: 50, usedCount: 8, expiresAt: "2026-12-31" },
]

// ============ STOCK ADJUSTMENTS ============
export const stockAdjustments: StockAdjustment[] = [
  { id: "sa1", variantId: "v1", delta: 100, reason: "Inbound shipment", operatorId: "u9", createdAt: "2026-01-02" },
  { id: "sa2", variantId: "v3", delta: -20, reason: "Quality defect removal", operatorId: "u9", createdAt: "2026-02-15" },
  { id: "sa3", variantId: "v8", delta: -50, reason: "Expired batch disposal", operatorId: "u9", createdAt: "2026-02-20" },
  { id: "sa4", variantId: "v10", delta: 30, reason: "Inbound shipment", operatorId: "u9", createdAt: "2026-03-01" },
]

// ============ HELPERS ============
export function getStockStatus(inv: Inventory): "in-stock" | "low-stock" | "out-of-stock" {
  if (inv.totalStock === 0) return "out-of-stock"
  if (inv.totalStock <= inv.lowStockThreshold) return "low-stock"
  return "in-stock"
}

export function getStockBadgeLabel(inv: Inventory): string {
  const status = getStockStatus(inv)
  if (status === "out-of-stock") return inv.restockDate ? `Restock on ${inv.restockDate}` : "Out of Stock"
  if (status === "low-stock") return "Low Stock"
  return "In Stock"
}

export function getUserPoints(userId: string): number {
  return pointsLedger.filter(e => e.userId === userId).reduce((sum, e) => sum + e.delta, 0)
}

export function getProductInventory(productId: string): Inventory[] {
  const product = products.find(p => p.id === productId)
  if (!product) return []
  return product.variants.map(v => inventory.find(i => i.variantId === v.id)!).filter(Boolean)
}

export function getVariantById(variantId: string): ProductVariant | undefined {
  for (const p of products) {
    const v = p.variants.find(v => v.id === variantId)
    if (v) return v
  }
  return undefined
}

export function getProductByVariantId(variantId: string): Product | undefined {
  return products.find(p => p.variants.some(v => v.id === variantId))
}
