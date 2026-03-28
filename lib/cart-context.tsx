"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface CartItem {
  id: string
  variantId?: string
  productId?: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  shippingCost: number
  total: number
  shippingMethod: string
  setShippingMethod: (method: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "junari-cart"
const SHIPPING_STORAGE_KEY = "junari-shipping"
const FREE_SHIPPING_THRESHOLD = 2000

export const SHIPPING_OPTIONS = [
  { id: "thaipost", name: "Thailand Post", rate: 50, days: "3-5 days" },
  { id: "flash", name: "Flash Express", rate: 70, days: "1-2 days" },
  { id: "kerry", name: "Kerry Express", rate: 80, days: "1-2 days" },
  { id: "jt", name: "J&T Express", rate: 65, days: "2-3 days" },
  { id: "dhl", name: "DHL Express", rate: 150, days: "Next day" },
]

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [shippingMethod, setShippingMethod] = useState("thaipost")
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    const storedShipping = localStorage.getItem(SHIPPING_STORAGE_KEY)
    
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (e) {
        console.error("Failed to parse cart:", e)
      }
    }
    
    if (storedShipping) {
      setShippingMethod(storedShipping)
    }
    
    setIsHydrated(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(SHIPPING_STORAGE_KEY, shippingMethod)
    }
  }, [shippingMethod, isHydrated])

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id))
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingOption = SHIPPING_OPTIONS.find(o => o.id === shippingMethod)
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingOption?.rate || 50)
  const total = subtotal + shippingCost

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingCost,
        total,
        shippingMethod,
        setShippingMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
