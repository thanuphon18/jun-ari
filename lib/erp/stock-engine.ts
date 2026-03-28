import { createClient } from "@/lib/supabase/server"

/**
 * Stock Ledger Engine
 *
 * Mirrors ERPNext's immutable Stock Ledger Entry (SLE) pattern:
 * - On Submit: insert SLE rows that track qty_after_transaction
 * - On Cancel: insert reverse SLE rows and mark originals as cancelled
 *
 * Every stock movement (Stock Entry, Delivery Note, Purchase Receipt)
 * calls this engine.
 */

export interface StockPostingLine {
  variant_id: string
  warehouse_id: string
  qty_change: number
  valuation_rate: number
}

interface StockPostingArgs {
  posting_date: string
  voucher_type: string
  voucher_id: string
  lines: StockPostingLine[]
}

/** Get current stock balance for a variant in a warehouse */
async function getCurrentQty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  variantId: string,
  warehouseId: string
): Promise<number> {
  const { data } = await supabase
    .from("stock_ledger_entries")
    .select("qty_after_transaction")
    .eq("variant_id", variantId)
    .eq("warehouse_id", warehouseId)
    .eq("is_cancelled", false)
    .order("created_at", { ascending: false })
    .limit(1)

  if (data && data.length > 0) return Number(data[0].qty_after_transaction)
  return 0
}

/** Post stock ledger entries on document submission */
export async function postStockLedgerEntries(args: StockPostingArgs) {
  const supabase = await createClient()

  for (const line of args.lines) {
    const currentQty = await getCurrentQty(supabase, line.variant_id, line.warehouse_id)
    const qtyAfter = currentQty + line.qty_change

    const { error } = await supabase.from("stock_ledger_entries").insert({
      posting_date: args.posting_date,
      variant_id: line.variant_id,
      warehouse_id: line.warehouse_id,
      qty_change: line.qty_change,
      valuation_rate: line.valuation_rate,
      qty_after_transaction: qtyAfter,
      voucher_type: args.voucher_type,
      voucher_id: args.voucher_id,
      is_cancelled: false,
    })

    if (error) throw new Error(`Failed to post SLE: ${error.message}`)

    // Also update the legacy inventory table for backward compatibility
    await syncLegacyInventory(supabase, line.variant_id, line.warehouse_id, qtyAfter)
  }
}

/** Reverse stock ledger entries on document cancellation */
export async function reverseStockLedgerEntries(voucherType: string, voucherId: string) {
  const supabase = await createClient()

  // Mark originals as cancelled
  await supabase
    .from("stock_ledger_entries")
    .update({ is_cancelled: true })
    .eq("voucher_type", voucherType)
    .eq("voucher_id", voucherId)
    .eq("is_cancelled", false)

  // Get originals
  const { data: originals } = await supabase
    .from("stock_ledger_entries")
    .select("*")
    .eq("voucher_type", voucherType)
    .eq("voucher_id", voucherId)
    .eq("is_cancelled", true)

  if (!originals || originals.length === 0) return

  for (const entry of originals) {
    const currentQty = await getCurrentQty(supabase, entry.variant_id, entry.warehouse_id)
    const reverseQty = -Number(entry.qty_change)
    const qtyAfter = currentQty + reverseQty

    await supabase.from("stock_ledger_entries").insert({
      posting_date: entry.posting_date,
      variant_id: entry.variant_id,
      warehouse_id: entry.warehouse_id,
      qty_change: reverseQty,
      valuation_rate: entry.valuation_rate,
      qty_after_transaction: qtyAfter,
      voucher_type: entry.voucher_type,
      voucher_id: entry.voucher_id,
      is_cancelled: true,
    })

    await syncLegacyInventory(supabase, entry.variant_id, entry.warehouse_id, qtyAfter)
  }
}

/** Sync the legacy inventory table (for the existing storefront) */
async function syncLegacyInventory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  variantId: string,
  warehouseId: string,
  newQty: number
) {
  // Resolve warehouse name
  const { data: wh } = await supabase
    .from("warehouses")
    .select("name")
    .eq("id", warehouseId)
    .single()

  if (!wh) return

  const warehouseName = wh.name.toLowerCase().replace(/\s+/g, "_")

  // Upsert inventory record
  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("variant_id", variantId)
    .eq("warehouse", warehouseName)
    .single()

  if (existing) {
    await supabase
      .from("inventory")
      .update({ qty_on_hand: Math.max(0, newQty) })
      .eq("id", existing.id)
  } else {
    await supabase.from("inventory").insert({
      variant_id: variantId,
      warehouse: warehouseName,
      qty_on_hand: Math.max(0, newQty),
      qty_reserved: 0,
      reorder_level: 10,
      reorder_qty: 50,
    })
  }
}

// ======================== STOCK BALANCE QUERY ========================

/** Get current stock balance grouped by variant + warehouse */
export async function getStockBalance(): Promise<
  { variant_id: string; warehouse_id: string; qty: number; valuation_rate: number }[]
> {
  const supabase = await createClient()

  // Get the latest SLE per variant+warehouse
  const { data, error } = await supabase
    .from("stock_ledger_entries")
    .select("variant_id, warehouse_id, qty_after_transaction, valuation_rate, created_at")
    .eq("is_cancelled", false)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  // Deduplicate: keep latest per variant+warehouse
  const seen = new Map<string, { variant_id: string; warehouse_id: string; qty: number; valuation_rate: number }>()
  for (const row of data) {
    const key = `${row.variant_id}:${row.warehouse_id}`
    if (!seen.has(key)) {
      seen.set(key, {
        variant_id: row.variant_id,
        warehouse_id: row.warehouse_id,
        qty: Number(row.qty_after_transaction),
        valuation_rate: Number(row.valuation_rate),
      })
    }
  }

  return Array.from(seen.values())
}
