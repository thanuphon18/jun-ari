import { createClient } from "@/lib/supabase/server"

/**
 * ERPNext-style auto-numbering: PREFIX-YYYY-NNNNN
 * e.g. SI-2026-00001, JE-2026-00001
 */

type Prefix = "SI" | "JE" | "PE" | "QTN" | "SE"

const TABLE_MAP: Record<Prefix, { table: string; column: string }> = {
  SI: { table: "sales_invoices", column: "invoice_number" },
  JE: { table: "journal_entries", column: "entry_number" },
  PE: { table: "payment_entries", column: "payment_number" },
  QTN: { table: "quotations", column: "quotation_number" },
  SE: { table: "stock_entries", column: "entry_number" },
}

export async function generateNumber(prefix: Prefix): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear()
  const pattern = `${prefix}-${year}-%`

  const { table, column } = TABLE_MAP[prefix]

  const { data } = await supabase
    .from(table)
    .select(column)
    .like(column, pattern)
    .order(column, { ascending: false })
    .limit(1)

  let next = 1
  if (data && data.length > 0) {
    const last = (data[0] as Record<string, string>)[column]
    const parts = last.split("-")
    const num = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(num)) next = num + 1
  }

  return `${prefix}-${year}-${String(next).padStart(5, "0")}`
}
