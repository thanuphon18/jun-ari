import { createClient } from "@/lib/supabase/server"

/**
 * General Ledger Posting Engine
 *
 * Mirrors ERPNext's immutable GL entry pattern:
 * - On Submit: insert GL entries (always balanced debit = credit)
 * - On Cancel: insert reverse GL entries marked is_cancelled = true
 *   and mark original entries as cancelled
 *
 * Every transaction that affects the books calls this engine.
 */

export interface GLPostingLine {
  account_id: string
  cost_center_id?: string | null
  debit: number
  credit: number
  party_type?: string | null
  party_id?: string | null
  remarks?: string | null
}

interface GLPostingArgs {
  posting_date: string
  voucher_type: string
  voucher_id: string
  lines: GLPostingLine[]
}

/** Validate that total debits = total credits */
function validateBalance(lines: GLPostingLine[]) {
  const totalDebit = lines.reduce((s, l) => s + Number(l.debit), 0)
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit), 0)
  const diff = Math.abs(totalDebit - totalCredit)
  if (diff > 0.01) {
    throw new Error(
      `GL entries are not balanced. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}, Difference: ${diff.toFixed(2)}`
    )
  }
}

/** Post GL entries on document submission */
export async function postGLEntries(args: GLPostingArgs) {
  validateBalance(args.lines)

  const supabase = await createClient()
  const entries = args.lines.map(line => ({
    posting_date: args.posting_date,
    account_id: line.account_id,
    cost_center_id: line.cost_center_id || null,
    debit: Number(line.debit),
    credit: Number(line.credit),
    party_type: line.party_type || null,
    party_id: line.party_id || null,
    voucher_type: args.voucher_type,
    voucher_id: args.voucher_id,
    remarks: line.remarks || null,
    is_cancelled: false,
  }))

  const { error } = await supabase.from("gl_entries").insert(entries)
  if (error) throw new Error(`Failed to post GL entries: ${error.message}`)
}

/** Reverse GL entries on document cancellation */
export async function reverseGLEntries(voucherType: string, voucherId: string) {
  const supabase = await createClient()

  // Mark original entries as cancelled
  const { error: updateError } = await supabase
    .from("gl_entries")
    .update({ is_cancelled: true })
    .eq("voucher_type", voucherType)
    .eq("voucher_id", voucherId)
    .eq("is_cancelled", false)

  if (updateError) throw new Error(`Failed to cancel GL entries: ${updateError.message}`)

  // Fetch original entries to create reversals
  const { data: originals, error: fetchError } = await supabase
    .from("gl_entries")
    .select("*")
    .eq("voucher_type", voucherType)
    .eq("voucher_id", voucherId)
    .eq("is_cancelled", true)

  if (fetchError) throw new Error(`Failed to fetch GL entries for reversal: ${fetchError.message}`)
  if (!originals || originals.length === 0) return

  // Insert reversed entries (swap debit/credit)
  const reversals = originals.map(entry => ({
    posting_date: entry.posting_date,
    account_id: entry.account_id,
    cost_center_id: entry.cost_center_id,
    debit: Number(entry.credit),
    credit: Number(entry.debit),
    party_type: entry.party_type,
    party_id: entry.party_id,
    voucher_type: entry.voucher_type,
    voucher_id: entry.voucher_id,
    remarks: `Cancellation: ${entry.remarks || ""}`.trim(),
    is_cancelled: true,
  }))

  const { error: insertError } = await supabase.from("gl_entries").insert(reversals)
  if (insertError) throw new Error(`Failed to insert GL reversals: ${insertError.message}`)
}

// ======================== WELL-KNOWN ACCOUNT LOOKUPS ========================

/** Find account by account_type */
export async function findAccountByType(accountType: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("id")
    .eq("account_type", accountType)
    .eq("is_group", false)
    .eq("is_active", true)
    .limit(1)
    .single()

  if (error || !data) throw new Error(`Account not found for type: ${accountType}`)
  return data.id
}

/** Build GL lines for a Sales Invoice submission (Thai tax system) */
export async function buildSalesInvoiceGLLines(invoice: {
  customer_id: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  grand_total: number
  wht_amount?: number
}): Promise<GLPostingLine[]> {
  const [receivableId, salesId, vatOutputId, whtReceivableId] = await Promise.all([
    findAccountByType("Receivable"),
    findAccountByType("Income Account"),
    findAccountById("b0000000-0000-0000-0000-000000000034"), // VAT Output Tax
    findAccountById("b0000000-0000-0000-0000-000000000016"), // WHT Receivable
  ])

  const lines: GLPostingLine[] = []
  const whtAmount = invoice.wht_amount || 0

  // Net receivable = grand_total - WHT (customer pays less if WHT deducted)
  const netReceivable = invoice.grand_total - whtAmount

  // Debit: Accounts Receivable (what customer will actually pay)
  if (netReceivable > 0) {
    lines.push({
      account_id: receivableId,
      debit: netReceivable,
      credit: 0,
      party_type: "Customer",
      party_id: invoice.customer_id,
      remarks: "Sales Invoice - Receivable (net of WHT)",
    })
  }

  // Debit: WHT Receivable (government owes us, customer deducted)
  if (whtAmount > 0) {
    lines.push({
      account_id: whtReceivableId,
      debit: whtAmount,
      credit: 0,
      party_type: "Customer",
      party_id: invoice.customer_id,
      remarks: "Sales Invoice - WHT Receivable",
    })
  }

  // Credit: Sales (revenue = subtotal - discount)
  const netSales = invoice.subtotal - invoice.discount_amount
  if (netSales > 0) {
    lines.push({
      account_id: salesId,
      debit: 0,
      credit: netSales,
      remarks: "Sales Invoice - Revenue",
    })
  }

  // Credit: VAT Output Tax (7% VAT liability)
  if (invoice.tax_amount > 0) {
    lines.push({
      account_id: vatOutputId,
      debit: 0,
      credit: invoice.tax_amount,
      remarks: "Sales Invoice - VAT 7%",
    })
  }

  return lines
}

/** Find account by ID (for well-known accounts) */
async function findAccountById(accountId: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", accountId)
    .single()

  if (error || !data) throw new Error(`Account not found: ${accountId}`)
  return data.id
}

/** Build GL lines for a Payment Entry */
export async function buildPaymentGLLines(payment: {
  paid_from: string
  paid_to: string
  paid_amount: number
  party_type?: string | null
  party_id?: string | null
}): Promise<GLPostingLine[]> {
  return [
    {
      account_id: payment.paid_to,
      debit: payment.paid_amount,
      credit: 0,
      party_type: payment.party_type || null,
      party_id: payment.party_id || null,
      remarks: "Payment Entry - Debit",
    },
    {
      account_id: payment.paid_from,
      debit: 0,
      credit: payment.paid_amount,
      party_type: payment.party_type || null,
      party_id: payment.party_id || null,
      remarks: "Payment Entry - Credit",
    },
  ]
}
