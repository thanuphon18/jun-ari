"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export interface CheckoutResult {
  clientSecret: string | null
  error?: string
}

export async function createCheckoutSession(
  cartItems: CartItem[],
  customerEmail?: string,
  shippingMethod?: string
): Promise<CheckoutResult> {
  try {
    if (!cartItems || cartItems.length === 0) {
      return { clientSecret: null, error: "Cart is empty" }
    }

    // Calculate shipping cost based on method
    let shippingCost = 0
    let shippingName = "Standard Shipping"
    
    switch (shippingMethod) {
      case "thaipost":
        shippingCost = 50 // ฿50
        shippingName = "Thailand Post (3-5 days)"
        break
      case "flash":
        shippingCost = 70 // ฿70
        shippingName = "Flash Express (1-2 days)"
        break
      case "kerry":
        shippingCost = 80 // ฿80
        shippingName = "Kerry Express (1-2 days)"
        break
      case "jt":
        shippingCost = 65 // ฿65
        shippingName = "J&T Express (2-3 days)"
        break
      case "dhl":
        shippingCost = 150 // ฿150
        shippingName = "DHL Express (Next day)"
        break
      default:
        shippingCost = 50
        shippingName = "Thailand Post (3-5 days)"
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Free shipping over ฿2,000
    const freeShippingThreshold = 2000
    const finalShippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCost

    // Create line items for Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: "thb",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to satang
      },
      quantity: item.quantity,
    }))

    // Add shipping as a line item if not free
    if (finalShippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "thb",
          product_data: {
            name: shippingName,
          },
          unit_amount: finalShippingCost * 100,
        },
        quantity: 1,
      })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Create checkout session with Thai payment methods
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["card", "promptpay"], // Thai payment methods
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customerEmail,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["TH"], // Thailand only
      },
      locale: "th", // Thai language
      metadata: {
        shipping_method: shippingMethod || "thaipost",
        shipping_cost: finalShippingCost.toString(),
      },
    })

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return { 
      clientSecret: null, 
      error: error instanceof Error ? error.message : "Failed to create checkout session" 
    }
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    })
    
    return {
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        shipping_details: session.shipping_details,
        metadata: session.metadata,
      },
    }
  } catch (error) {
    console.error("Get session error:", error)
    return { success: false, error: "Failed to retrieve session" }
  }
}

export async function createOrder(
  sessionId: string,
  cartItems: CartItem[],
  userId?: string
) {
  try {
    const sessionResult = await getCheckoutSession(sessionId)
    
    if (!sessionResult.success || !sessionResult.session) {
      return { success: false, error: "Invalid session" }
    }

    const session = sessionResult.session
    
    if (session.payment_status !== "paid") {
      return { success: false, error: "Payment not completed" }
    }

    const supabase = await createClient()

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        stripe_session_id: sessionId,
        status: "paid",
        total_amount: session.amount_total,
        currency: session.currency?.toUpperCase() || "THB",
        customer_email: session.customer_email,
        shipping_address: session.shipping_details,
        shipping_method: session.metadata?.shipping_method || "thaipost",
        shipping_cost: parseFloat(session.metadata?.shipping_cost || "0"),
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return { success: false, error: "Failed to create order" }
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Order items error:", itemsError)
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Create order error:", error)
    return { success: false, error: "Failed to create order" }
  }
}
