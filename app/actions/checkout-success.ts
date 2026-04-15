"use server"

import { createServiceRoleClient } from "@/lib/supabase/service-role"

export type OrderStatusByReference = {
  payment_status: string
  order_number: string
} | null

/**
 * Looks up the pending Beam order by `ref:{referenceId}` in `orders.notes`.
 * Uses service role so guests can see status on the success page without session.
 */
export async function getOrderStatusByPaymentReference(
  referenceId: string
): Promise<OrderStatusByReference> {
  const ref = referenceId?.trim()
  if (!ref) return null

  const supabase = createServiceRoleClient()
  if (!supabase) return null

  const needle = `ref:${ref}`
  const { data } = await supabase
    .from("orders")
    .select("payment_status, order_number")
    .ilike("notes", `%${needle}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return {
    payment_status: String(data.payment_status ?? "unpaid"),
    order_number: String(data.order_number ?? ""),
  }
}
