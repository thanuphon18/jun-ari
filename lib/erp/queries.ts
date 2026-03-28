import { createClient } from "@/lib/supabase/server"
import type {
  Account, FiscalYear, CostCenter, Tax,
  JournalEntry, GLEntry, PaymentEntry,
  Customer, SalesInvoice, Quotation, PricingRule,
  Warehouse, StockEntry, StockLedgerEntry,
  TrialBalanceRow,
} from "./types"

// ======================== CHART OF ACCOUNTS ========================

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("account_number", { ascending: true })
  if (error) throw error
  return (data ?? []) as Account[]
}

export async function getLeafAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_group", false)
    .eq("is_active", true)
    .order("account_number", { ascending: true })
  if (error) throw error
  return (data ?? []) as Account[]
}

export async function getAccountsByType(accountType: string): Promise<Account[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("account_type", accountType)
    .eq("is_group", false)
    .eq("is_active", true)
  if (error) throw error
  return (data ?? []) as Account[]
}

/** Build tree structure from flat accounts list */
export function buildAccountTree(accounts: Account[]): Account[] {
  const map = new Map<string, Account>()
  const roots: Account[] = []

  accounts.forEach(a => map.set(a.id, { ...a, children: [] }))
  accounts.forEach(a => {
    const node = map.get(a.id)!
    if (a.parent_id && map.has(a.parent_id)) {
      map.get(a.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// ======================== FISCAL YEARS ========================

export async function getFiscalYears(): Promise<FiscalYear[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("fiscal_years")
    .select("*")
    .order("start_date", { ascending: false })
  if (error) throw error
  return (data ?? []) as FiscalYear[]
}

// ======================== COST CENTERS ========================

export async function getCostCenters(): Promise<CostCenter[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cost_centers")
    .select("*")
    .order("name")
  if (error) throw error
  return (data ?? []) as CostCenter[]
}

// ======================== TAXES ========================

export async function getTaxes(category?: "VAT" | "WHT"): Promise<Tax[]> {
  const supabase = await createClient()
  let query = supabase
    .from("taxes")
    .select("*, accounts(*)")
  
  if (category) {
    query = query.eq("tax_category", category)
  }
  
  query = query.order("name")
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Tax[]
}

export async function getVatTaxes(): Promise<Tax[]> {
  return getTaxes("VAT")
}

export async function getWhtTaxes(): Promise<Tax[]> {
  return getTaxes("WHT")
}

// ======================== JOURNAL ENTRIES ========================

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*, journal_entry_items(*, accounts(*)), profiles(full_name)")
    .order("posting_date", { ascending: false })
  if (error) throw error
  return (data ?? []) as JournalEntry[]
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*, journal_entry_items(*, accounts(*), cost_centers(*)), profiles(full_name)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as JournalEntry
}

// ======================== GL ENTRIES ========================

export async function getGLEntries(filters?: {
  account_id?: string
  from_date?: string
  to_date?: string
  voucher_type?: string
  party_type?: string
  party_id?: string
}): Promise<GLEntry[]> {
  const supabase = await createClient()
  let query = supabase
    .from("gl_entries")
    .select("*, accounts(name, account_number, root_type)")
    .eq("is_cancelled", false)
    .order("posting_date", { ascending: false })

  if (filters?.account_id) query = query.eq("account_id", filters.account_id)
  if (filters?.from_date) query = query.gte("posting_date", filters.from_date)
  if (filters?.to_date) query = query.lte("posting_date", filters.to_date)
  if (filters?.voucher_type) query = query.eq("voucher_type", filters.voucher_type)
  if (filters?.party_type) query = query.eq("party_type", filters.party_type)
  if (filters?.party_id) query = query.eq("party_id", filters.party_id)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as GLEntry[]
}

// ======================== PAYMENT ENTRIES ========================

export async function getPaymentEntries(): Promise<PaymentEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("payment_entries")
    .select("*, profiles(full_name)")
    .order("posting_date", { ascending: false })
  if (error) throw error
  return (data ?? []) as PaymentEntry[]
}

export async function getPaymentEntryById(id: string): Promise<PaymentEntry | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("payment_entries")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as PaymentEntry
}

// ======================== CUSTOMERS ========================

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*, profiles(full_name, email)")
    .order("customer_name")
  if (error) throw error
  return (data ?? []) as Customer[]
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as Customer
}

// ======================== SALES INVOICES ========================

export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sales_invoices")
    .select("*, customers(customer_name, customer_group), profiles(full_name)")
    .order("posting_date", { ascending: false })
  if (error) throw error
  return (data ?? []) as SalesInvoice[]
}

export async function getSalesInvoiceById(id: string): Promise<SalesInvoice | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sales_invoices")
    .select("*, sales_invoice_items(*), customers(customer_name, customer_group, customer_type), profiles(full_name)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as SalesInvoice
}

// ======================== QUOTATIONS ========================

export async function getQuotations(): Promise<Quotation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quotations")
    .select("*, customers(customer_name), profiles(full_name)")
    .order("posting_date", { ascending: false })
  if (error) throw error
  return (data ?? []) as Quotation[]
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quotations")
    .select("*, quotation_items(*), customers(customer_name, customer_group), profiles(full_name)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as Quotation
}

// ======================== PRICING RULES ========================

export async function getPricingRules(): Promise<PricingRule[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pricing_rules")
    .select("*")
    .order("priority", { ascending: true })
  if (error) throw error
  return (data ?? []) as PricingRule[]
}

// ======================== WAREHOUSES ========================

export async function getWarehouses(): Promise<Warehouse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .order("name")
  if (error) throw error
  return (data ?? []) as Warehouse[]
}

export async function getLeafWarehouses(): Promise<Warehouse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("is_group", false)
    .eq("is_active", true)
    .order("name")
  if (error) throw error
  return (data ?? []) as Warehouse[]
}

export function buildWarehouseTree(warehouses: Warehouse[]): Warehouse[] {
  const map = new Map<string, Warehouse>()
  const roots: Warehouse[] = []
  warehouses.forEach(w => map.set(w.id, { ...w, children: [] }))
  warehouses.forEach(w => {
    const node = map.get(w.id)!
    if (w.parent_id && map.has(w.parent_id)) {
      map.get(w.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

// ======================== STOCK ENTRIES ========================

export async function getStockEntries(): Promise<StockEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stock_entries")
    .select("*, stock_entry_items(*, product_variants(sku, name, products(name))), profiles(full_name)")
    .order("posting_date", { ascending: false })
  if (error) throw error
  return (data ?? []) as StockEntry[]
}

export async function getStockEntryById(id: string): Promise<StockEntry | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stock_entries")
    .select("*, stock_entry_items(*, product_variants(sku, name, products(name))), profiles(full_name)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as StockEntry
}

// ======================== STOCK LEDGER ========================

export async function getStockLedgerEntries(filters?: {
  variant_id?: string
  warehouse_id?: string
  from_date?: string
  to_date?: string
}): Promise<StockLedgerEntry[]> {
  const supabase = await createClient()
  let query = supabase
    .from("stock_ledger_entries")
    .select("*, product_variants(sku, name), warehouses(name)")
    .eq("is_cancelled", false)
    .order("posting_date", { ascending: false })

  if (filters?.variant_id) query = query.eq("variant_id", filters.variant_id)
  if (filters?.warehouse_id) query = query.eq("warehouse_id", filters.warehouse_id)
  if (filters?.from_date) query = query.gte("posting_date", filters.from_date)
  if (filters?.to_date) query = query.lte("posting_date", filters.to_date)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as StockLedgerEntry[]
}

// ======================== PRODUCT SEARCH (for invoice/quotation forms) ========================

export interface ProductVariantSearchResult {
  id: string
  sku: string
  name: string
  price: number
  product_name: string
  product_id: string
  unit: string
}

export async function searchProductVariants(searchTerm: string): Promise<ProductVariantSearchResult[]> {
  const supabase = await createClient()
  
  // Search by SKU or name (case-insensitive)
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, sku, name, price, products(id, name, unit)")
    .or(`sku.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
    .limit(20)

  if (error) throw error
  
  return (data ?? []).map(v => ({
    id: v.id,
    sku: v.sku,
    name: v.name,
    price: Number(v.price),
    product_name: (v.products as { name: string })?.name ?? "",
    product_id: (v.products as { id: string })?.id ?? "",
    unit: (v.products as { unit: string })?.unit ?? "pc",
  }))
}

export async function getAllProductVariantsForSelect(): Promise<ProductVariantSearchResult[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, sku, name, price, products(id, name, unit)")
    .order("sku")
    .limit(500)

  if (error) throw error
  
  return (data ?? []).map(v => ({
    id: v.id,
    sku: v.sku,
    name: v.name,
    price: Number(v.price),
    product_name: (v.products as { name: string })?.name ?? "",
    product_id: (v.products as { id: string })?.id ?? "",
    unit: (v.products as { unit: string })?.unit ?? "pc",
  }))
}

// ======================== ORDERS FOR INVOICE CREATION ========================

export async function getUnbilledOrders() {
  const supabase = await createClient()
  
  // Get orders that are delivered/completed but not yet invoiced
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at, profiles(full_name, email)")
    .in("status", ["delivered", "completed", "processing"])
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

export async function getOrderForInvoice(orderId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(id, full_name, email, phone, address)")
    .eq("id", orderId)
    .single()

  if (error) return null
  return data
}

// ======================== TRIAL BALANCE ========================

export async function getTrialBalance(fromDate: string, toDate: string): Promise<TrialBalanceRow[]> {
  const supabase = await createClient()

  // Get all leaf accounts
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, account_number, root_type")
    .eq("is_group", false)
    .eq("is_active", true)
    .order("account_number")

  if (!accounts) return []

  // Get all GL entries in period
  const { data: glInPeriod } = await supabase
    .from("gl_entries")
    .select("account_id, debit, credit")
    .eq("is_cancelled", false)
    .gte("posting_date", fromDate)
    .lte("posting_date", toDate)

  // Get opening GL entries (before period)
  const { data: glOpening } = await supabase
    .from("gl_entries")
    .select("account_id, debit, credit")
    .eq("is_cancelled", false)
    .lt("posting_date", fromDate)

  const openingMap = new Map<string, { debit: number; credit: number }>()
  ;(glOpening ?? []).forEach(gl => {
    const cur = openingMap.get(gl.account_id) ?? { debit: 0, credit: 0 }
    cur.debit += Number(gl.debit)
    cur.credit += Number(gl.credit)
    openingMap.set(gl.account_id, cur)
  })

  const periodMap = new Map<string, { debit: number; credit: number }>()
  ;(glInPeriod ?? []).forEach(gl => {
    const cur = periodMap.get(gl.account_id) ?? { debit: 0, credit: 0 }
    cur.debit += Number(gl.debit)
    cur.credit += Number(gl.credit)
    periodMap.set(gl.account_id, cur)
  })

  const rows: TrialBalanceRow[] = accounts
    .map(a => {
      const opening = openingMap.get(a.id) ?? { debit: 0, credit: 0 }
      const period = periodMap.get(a.id) ?? { debit: 0, credit: 0 }
      const closingDebit = opening.debit + period.debit
      const closingCredit = opening.credit + period.credit

      return {
        account_id: a.id,
        account_name: a.name,
        account_number: a.account_number,
        root_type: a.root_type,
        opening_debit: opening.debit,
        opening_credit: opening.credit,
        debit: period.debit,
        credit: period.credit,
        closing_debit: closingDebit,
        closing_credit: closingCredit,
      }
    })
    .filter(r => r.closing_debit > 0 || r.closing_credit > 0 || r.debit > 0 || r.credit > 0)

  return rows
}
