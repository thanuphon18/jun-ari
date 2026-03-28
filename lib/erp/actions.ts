"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateNumber } from "./numbering"
import { postGLEntries, reverseGLEntries, buildSalesInvoiceGLLines, buildPaymentGLLines } from "./gl-engine"
import { postStockLedgerEntries, reverseStockLedgerEntries } from "./stock-engine"

type Result = { success: true } | { success: false; error: string }

// ======================== ACCOUNTS ========================

export async function createAccount(data: {
  name: string
  account_number?: string
  parent_id: string | null
  root_type: string
  account_type?: string | null
  is_group: boolean
  balance_direction: string
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("accounts").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting")
  return { success: true }
}

export async function updateAccount(id: string, data: {
  name?: string
  account_number?: string
  account_type?: string | null
  is_active?: boolean
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("accounts").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting")
  return { success: true }
}

// ======================== JOURNAL ENTRIES ========================

export async function createJournalEntry(data: {
  entry_type: string
  posting_date: string
  user_remark?: string
  items: { account_id: string; cost_center_id?: string; debit: number; credit: number; party_type?: string; party_id?: string }[]
}): Promise<Result & { id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const totalDebit = data.items.reduce((s, i) => s + Number(i.debit), 0)
  const totalCredit = data.items.reduce((s, i) => s + Number(i.credit), 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return { success: false, error: "Total debit must equal total credit" }
  }

  const entryNumber = await generateNumber("JE")

  const { data: je, error } = await supabase
    .from("journal_entries")
    .insert({
      entry_number: entryNumber,
      entry_type: data.entry_type,
      posting_date: data.posting_date,
      docstatus: 0,
      user_remark: data.user_remark || null,
      total_debit: totalDebit,
      total_credit: totalCredit,
      created_by: user?.id || null,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  const items = data.items.map(item => ({
    journal_entry_id: je.id,
    account_id: item.account_id,
    cost_center_id: item.cost_center_id || null,
    debit: item.debit,
    credit: item.credit,
    party_type: item.party_type || null,
    party_id: item.party_id || null,
  }))

  const { error: itemsError } = await supabase.from("journal_entry_items").insert(items)
  if (itemsError) return { success: false, error: itemsError.message }

  revalidatePath("/admin/accounting/journal-entries")
  return { success: true, id: je.id }
}

export async function submitJournalEntry(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: je } = await supabase
    .from("journal_entries")
    .select("*, journal_entry_items(*)")
    .eq("id", id)
    .single()

  if (!je) return { success: false, error: "Journal Entry not found" }
  if (je.docstatus !== 0) return { success: false, error: "Can only submit Draft entries" }

  // Post GL entries
  const glLines = je.journal_entry_items.map((item: { account_id: string; cost_center_id: string | null; debit: number; credit: number; party_type: string | null; party_id: string | null }) => ({
    account_id: item.account_id,
    cost_center_id: item.cost_center_id,
    debit: Number(item.debit),
    credit: Number(item.credit),
    party_type: item.party_type,
    party_id: item.party_id,
    remarks: `Journal Entry ${je.entry_number}`,
  }))

  try {
    await postGLEntries({
      posting_date: je.posting_date,
      voucher_type: "Journal Entry",
      voucher_id: je.id,
      lines: glLines,
    })
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from("journal_entries")
    .update({ docstatus: 1 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting")
  return { success: true }
}

export async function cancelJournalEntry(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: je } = await supabase
    .from("journal_entries")
    .select("docstatus")
    .eq("id", id)
    .single()

  if (!je) return { success: false, error: "Not found" }
  if (je.docstatus !== 1) return { success: false, error: "Can only cancel Submitted entries" }

  try {
    await reverseGLEntries("Journal Entry", id)
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from("journal_entries")
    .update({ docstatus: 2 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting")
  return { success: true }
}

// ======================== PAYMENT ENTRIES ========================

export async function createPaymentEntry(data: {
  payment_type: string
  posting_date: string
  party_type?: string
  party_id?: string
  paid_from: string
  paid_to: string
  paid_amount: number
  reference_type?: string
  reference_id?: string
  remarks?: string
}): Promise<Result & { id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const paymentNumber = await generateNumber("PE")

  const { data: pe, error } = await supabase
    .from("payment_entries")
    .insert({
      payment_number: paymentNumber,
      payment_type: data.payment_type,
      posting_date: data.posting_date,
      docstatus: 0,
      party_type: data.party_type || null,
      party_id: data.party_id || null,
      paid_from: data.paid_from,
      paid_to: data.paid_to,
      paid_amount: data.paid_amount,
      reference_type: data.reference_type || null,
      reference_id: data.reference_id || null,
      remarks: data.remarks || null,
      created_by: user?.id || null,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting/payments")
  return { success: true, id: pe.id }
}

export async function submitPaymentEntry(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: pe } = await supabase
    .from("payment_entries")
    .select("*")
    .eq("id", id)
    .single()

  if (!pe) return { success: false, error: "Payment Entry not found" }
  if (pe.docstatus !== 0) return { success: false, error: "Can only submit Draft entries" }

  try {
    const glLines = await buildPaymentGLLines({
      paid_from: pe.paid_from,
      paid_to: pe.paid_to,
      paid_amount: Number(pe.paid_amount),
      party_type: pe.party_type,
      party_id: pe.party_id,
    })

    await postGLEntries({
      posting_date: pe.posting_date,
      voucher_type: "Payment Entry",
      voucher_id: pe.id,
      lines: glLines,
    })
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  // Update invoice outstanding if this is against a Sales Invoice
  if (pe.reference_type === "Sales Invoice" && pe.reference_id) {
    const { data: si } = await supabase
      .from("sales_invoices")
      .select("outstanding_amount, paid_amount, grand_total")
      .eq("id", pe.reference_id)
      .single()

    if (si) {
      const newPaid = Number(si.paid_amount) + Number(pe.paid_amount)
      const newOutstanding = Number(si.grand_total) - newPaid
      const newStatus = newOutstanding <= 0 ? "Paid" : "Unpaid"

      await supabase
        .from("sales_invoices")
        .update({
          paid_amount: newPaid,
          outstanding_amount: Math.max(0, newOutstanding),
          status: newStatus,
        })
        .eq("id", pe.reference_id)
    }
  }

  const { error } = await supabase
    .from("payment_entries")
    .update({ docstatus: 1 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting")
  return { success: true }
}

export async function cancelPaymentEntry(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: pe } = await supabase
    .from("payment_entries")
    .select("*")
    .eq("id", id)
    .single()

  if (!pe || pe.docstatus !== 1) return { success: false, error: "Can only cancel Submitted entries" }

  try {
    await reverseGLEntries("Payment Entry", id)
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  // Reverse invoice outstanding
  if (pe.reference_type === "Sales Invoice" && pe.reference_id) {
    const { data: si } = await supabase
      .from("sales_invoices")
      .select("outstanding_amount, paid_amount, grand_total")
      .eq("id", pe.reference_id)
      .single()

    if (si) {
      const newPaid = Math.max(0, Number(si.paid_amount) - Number(pe.paid_amount))
      const newOutstanding = Number(si.grand_total) - newPaid

      await supabase
        .from("sales_invoices")
        .update({
          paid_amount: newPaid,
          outstanding_amount: newOutstanding,
          status: newOutstanding > 0 ? "Unpaid" : "Paid",
        })
        .eq("id", pe.reference_id)
    }
  }

  const { error } = await supabase
    .from("payment_entries")
    .update({ docstatus: 2 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/accounting")
  return { success: true }
}

// ======================== CUSTOMERS ========================

export async function createCustomer(data: {
  customer_name: string
  customer_type: string
  customer_group: string
  territory?: string
  tax_id?: string
  credit_limit?: number
  credit_days?: number
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("customers").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling/customers")
  return { success: true }
}

export async function updateCustomer(id: string, data: {
  customer_name?: string
  customer_type?: string
  customer_group?: string
  territory?: string
  tax_id?: string
  credit_limit?: number
  credit_days?: number
  is_active?: boolean
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("customers").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling/customers")
  return { success: true }
}

// ======================== SALES INVOICES ========================

export async function createSalesInvoice(data: {
  customer_id: string
  posting_date: string
  due_date?: string
  order_id?: string
  items: { variant_id?: string; item_name: string; description?: string; qty: number; rate: number }[]
  tax_amount?: number
  discount_amount?: number
  // Thai tax fields
  is_tax_invoice?: boolean
  tax_invoice_number?: string
  tax_invoice_date?: string
  seller_tax_id?: string
  buyer_tax_id?: string
  branch_number?: string
  vat_included?: boolean
  wht_rate?: number
  wht_amount?: number
}): Promise<Result & { id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const invoiceNumber = await generateNumber("SI")
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.rate, 0)
  const taxAmount = data.tax_amount ?? 0
  const discountAmount = data.discount_amount ?? 0
  const whtAmount = data.wht_amount ?? 0
  const grandTotal = subtotal - discountAmount + taxAmount
  const netTotal = subtotal - discountAmount // Amount before VAT

  const { data: si, error } = await supabase
    .from("sales_invoices")
    .insert({
      invoice_number: invoiceNumber,
      customer_id: data.customer_id,
      posting_date: data.posting_date,
      due_date: data.due_date || null,
      docstatus: 0,
      order_id: data.order_id || null,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      grand_total: grandTotal,
      net_total: netTotal,
      outstanding_amount: grandTotal - whtAmount, // Customer pays less if WHT deducted
      paid_amount: 0,
      status: "Draft",
      // Thai tax fields
      is_tax_invoice: data.is_tax_invoice ?? false,
      tax_invoice_number: data.tax_invoice_number || null,
      tax_invoice_date: data.tax_invoice_date || null,
      seller_tax_id: data.seller_tax_id || null,
      buyer_tax_id: data.buyer_tax_id || null,
      branch_number: data.branch_number || "สำนักงานใหญ่",
      vat_included: data.vat_included ?? true,
      wht_rate: data.wht_rate ?? 0,
      wht_amount: whtAmount,
      created_by: user?.id || null,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  const items = data.items.map(item => ({
    sales_invoice_id: si.id,
    variant_id: item.variant_id || null,
    item_name: item.item_name,
    description: item.description || null,
    qty: item.qty,
    rate: item.rate,
    amount: item.qty * item.rate,
  }))

  const { error: itemsError } = await supabase.from("sales_invoice_items").insert(items)
  if (itemsError) return { success: false, error: itemsError.message }

  revalidatePath("/admin/selling/invoices")
  return { success: true, id: si.id }
}

export async function submitSalesInvoice(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: si } = await supabase
    .from("sales_invoices")
    .select("*")
    .eq("id", id)
    .single()

  if (!si) return { success: false, error: "Sales Invoice not found" }
  if (si.docstatus !== 0) return { success: false, error: "Can only submit Draft invoices" }

  try {
    const glLines = await buildSalesInvoiceGLLines({
      customer_id: si.customer_id,
      subtotal: Number(si.subtotal),
      tax_amount: Number(si.tax_amount),
      discount_amount: Number(si.discount_amount),
      grand_total: Number(si.grand_total),
      wht_amount: Number(si.wht_amount || 0),
    })

    await postGLEntries({
      posting_date: si.posting_date,
      voucher_type: "Sales Invoice",
      voucher_id: si.id,
      lines: glLines,
    })
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from("sales_invoices")
    .update({ docstatus: 1, status: "Unpaid" })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling")
  return { success: true }
}

export async function cancelSalesInvoice(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: si } = await supabase
    .from("sales_invoices")
    .select("docstatus, paid_amount")
    .eq("id", id)
    .single()

  if (!si || si.docstatus !== 1) return { success: false, error: "Can only cancel Submitted invoices" }
  if (Number(si.paid_amount) > 0) return { success: false, error: "Cannot cancel invoice with payments. Cancel payments first." }

  try {
    await reverseGLEntries("Sales Invoice", id)
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from("sales_invoices")
    .update({ docstatus: 2, status: "Cancelled", outstanding_amount: 0 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling")
  return { success: true }
}

// ======================== QUOTATIONS ========================

export async function createQuotation(data: {
  customer_id: string
  posting_date: string
  valid_until?: string
  items: { variant_id?: string; item_name: string; qty: number; rate: number }[]
  tax_amount?: number
}): Promise<Result & { id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const quotationNumber = await generateNumber("QTN")
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.rate, 0)
  const taxAmount = data.tax_amount ?? 0
  const grandTotal = subtotal + taxAmount

  const { data: q, error } = await supabase
    .from("quotations")
    .insert({
      quotation_number: quotationNumber,
      customer_id: data.customer_id,
      posting_date: data.posting_date,
      valid_until: data.valid_until || null,
      docstatus: 0,
      subtotal,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      status: "Draft",
      created_by: user?.id || null,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  const items = data.items.map(item => ({
    quotation_id: q.id,
    variant_id: item.variant_id || null,
    item_name: item.item_name,
    qty: item.qty,
    rate: item.rate,
    amount: item.qty * item.rate,
  }))

  const { error: itemsError } = await supabase.from("quotation_items").insert(items)
  if (itemsError) return { success: false, error: itemsError.message }

  revalidatePath("/admin/selling/quotations")
  return { success: true, id: q.id }
}

export async function submitQuotation(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: q } = await supabase.from("quotations").select("docstatus").eq("id", id).single()
  if (!q || q.docstatus !== 0) return { success: false, error: "Can only submit Draft quotations" }

  const { error } = await supabase
    .from("quotations")
    .update({ docstatus: 1, status: "Open" })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling/quotations")
  return { success: true }
}

export async function cancelQuotation(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: q } = await supabase.from("quotations").select("docstatus").eq("id", id).single()
  if (!q || q.docstatus !== 1) return { success: false, error: "Can only cancel Submitted quotations" }

  const { error } = await supabase
    .from("quotations")
    .update({ docstatus: 2, status: "Cancelled" })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling/quotations")
  return { success: true }
}

// ======================== PRICING RULES ========================

export async function createPricingRule(data: {
  name: string
  applicable_for: string
  applicable_value?: string
  variant_id?: string
  product_id?: string
  min_qty: number
  max_qty?: number
  discount_percentage?: number
  discount_amount?: number
  rate?: number
  priority?: number
  valid_from?: string
  valid_until?: string
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("pricing_rules").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling/pricing-rules")
  return { success: true }
}

export async function updatePricingRule(id: string, data: Partial<{
  name: string
  is_active: boolean
  discount_percentage: number
  discount_amount: number
  rate: number
  min_qty: number
  max_qty: number
  valid_from: string
  valid_until: string
}>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("pricing_rules").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/selling/pricing-rules")
  return { success: true }
}

// ======================== WAREHOUSES ========================

export async function createWarehouse(data: {
  name: string
  parent_id?: string
  is_group?: boolean
  address?: string
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("warehouses").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/stock/warehouses")
  return { success: true }
}

export async function updateWarehouse(id: string, data: {
  name?: string
  address?: string
  is_active?: boolean
}): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("warehouses").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/stock/warehouses")
  return { success: true }
}

// ======================== STOCK ENTRIES ========================

export async function createStockEntry(data: {
  entry_type: string
  posting_date: string
  source_warehouse_id?: string
  target_warehouse_id?: string
  remarks?: string
  items: { variant_id: string; qty: number; valuation_rate: number; source_warehouse_id?: string; target_warehouse_id?: string }[]
}): Promise<Result & { id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const entryNumber = await generateNumber("SE")

  const { data: se, error } = await supabase
    .from("stock_entries")
    .insert({
      entry_number: entryNumber,
      entry_type: data.entry_type,
      posting_date: data.posting_date,
      docstatus: 0,
      source_warehouse_id: data.source_warehouse_id || null,
      target_warehouse_id: data.target_warehouse_id || null,
      remarks: data.remarks || null,
      created_by: user?.id || null,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  const items = data.items.map(item => ({
    stock_entry_id: se.id,
    variant_id: item.variant_id,
    qty: item.qty,
    valuation_rate: item.valuation_rate,
    amount: item.qty * item.valuation_rate,
    source_warehouse_id: item.source_warehouse_id || data.source_warehouse_id || null,
    target_warehouse_id: item.target_warehouse_id || data.target_warehouse_id || null,
  }))

  const { error: itemsError } = await supabase.from("stock_entry_items").insert(items)
  if (itemsError) return { success: false, error: itemsError.message }

  revalidatePath("/admin/stock/entries")
  return { success: true, id: se.id }
}

export async function submitStockEntry(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: se } = await supabase
    .from("stock_entries")
    .select("*, stock_entry_items(*)")
    .eq("id", id)
    .single()

  if (!se) return { success: false, error: "Stock Entry not found" }
  if (se.docstatus !== 0) return { success: false, error: "Can only submit Draft entries" }

  const stockLines: { variant_id: string; warehouse_id: string; qty_change: number; valuation_rate: number }[] = []

  for (const item of se.stock_entry_items) {
    // Material Issue or Transfer: subtract from source
    if (se.entry_type === "Material Issue" || se.entry_type === "Material Transfer") {
      const sourceWh = item.source_warehouse_id || se.source_warehouse_id
      if (sourceWh) {
        stockLines.push({
          variant_id: item.variant_id,
          warehouse_id: sourceWh,
          qty_change: -Number(item.qty),
          valuation_rate: Number(item.valuation_rate),
        })
      }
    }

    // Material Receipt or Transfer: add to target
    if (se.entry_type === "Material Receipt" || se.entry_type === "Material Transfer") {
      const targetWh = item.target_warehouse_id || se.target_warehouse_id
      if (targetWh) {
        stockLines.push({
          variant_id: item.variant_id,
          warehouse_id: targetWh,
          qty_change: Number(item.qty),
          valuation_rate: Number(item.valuation_rate),
        })
      }
    }
  }

  try {
    await postStockLedgerEntries({
      posting_date: se.posting_date,
      voucher_type: "Stock Entry",
      voucher_id: se.id,
      lines: stockLines,
    })
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from("stock_entries")
    .update({ docstatus: 1 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/stock")
  return { success: true }
}

export async function cancelStockEntry(id: string): Promise<Result> {
  const supabase = await createClient()

  const { data: se } = await supabase
    .from("stock_entries")
    .select("docstatus")
    .eq("id", id)
    .single()

  if (!se || se.docstatus !== 1) return { success: false, error: "Can only cancel Submitted entries" }

  try {
    await reverseStockLedgerEntries("Stock Entry", id)
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from("stock_entries")
    .update({ docstatus: 2 })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/stock")
  return { success: true }
}
