// ========================================================
// ERP Type Definitions — Frappe/ERPNext-style docstatus workflow
// ========================================================

/** Frappe docstatus: 0=Draft, 1=Submitted, 2=Cancelled */
export type DocStatus = 0 | 1 | 2

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  0: "Draft",
  1: "Submitted",
  2: "Cancelled",
}

// ======================== ACCOUNTING ========================

export interface Account {
  id: string
  name: string
  account_number: string | null
  parent_id: string | null
  root_type: "Asset" | "Liability" | "Income" | "Expense" | "Equity"
  account_type: string | null
  is_group: boolean
  balance_direction: "debit" | "credit"
  currency: string
  is_active: boolean
  created_at: string
  // Joined
  children?: Account[]
}

export interface FiscalYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_default: boolean
  created_at: string
}

export interface CostCenter {
  id: string
  name: string
  parent_id: string | null
  is_group: boolean
  is_default: boolean
  created_at: string
  children?: CostCenter[]
}

export interface Tax {
  id: string
  name: string
  rate: number
  tax_type: "Percentage" | "Fixed"
  tax_category: "VAT" | "WHT"
  account_id: string | null
  is_default: boolean
  created_at: string
  accounts?: Account
}

export interface JournalEntry {
  id: string
  entry_number: string
  entry_type: "Journal Entry" | "Bank Entry" | "Cash Entry" | "Credit Note" | "Debit Note" | "Opening Entry"
  posting_date: string
  docstatus: DocStatus
  user_remark: string | null
  total_debit: number
  total_credit: number
  amended_from: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  journal_entry_items?: JournalEntryItem[]
  profiles?: { full_name: string } | null
}

export interface JournalEntryItem {
  id: string
  journal_entry_id: string
  account_id: string
  cost_center_id: string | null
  debit: number
  credit: number
  party_type: "Customer" | "Supplier" | null
  party_id: string | null
  reference_type: string | null
  reference_id: string | null
  // Joined
  accounts?: Account
  cost_centers?: CostCenter
}

export interface GLEntry {
  id: string
  posting_date: string
  account_id: string
  cost_center_id: string | null
  debit: number
  credit: number
  party_type: string | null
  party_id: string | null
  voucher_type: string
  voucher_id: string
  remarks: string | null
  is_cancelled: boolean
  created_at: string
  // Joined
  accounts?: Account
}

export interface PaymentEntry {
  id: string
  payment_number: string
  payment_type: "Receive" | "Pay" | "Internal Transfer"
  posting_date: string
  docstatus: DocStatus
  party_type: "Customer" | "Supplier" | null
  party_id: string | null
  paid_from: string | null
  paid_to: string | null
  paid_amount: number
  reference_type: string | null
  reference_id: string | null
  remarks: string | null
  amended_from: string | null
  created_by: string | null
  created_at: string
  // Joined
  profiles?: { full_name: string } | null
  paid_from_account?: Account
  paid_to_account?: Account
  customers?: { customer_name: string } | null
}

// ======================== SELLING ========================

export interface Customer {
  id: string
  customer_name: string
  customer_type: "Individual" | "Company"
  customer_group: "Retail" | "Wholesale"
  territory: string | null
  profile_id: string | null
  tax_id: string | null
  tax_id_13: string | null // Thai 13-digit tax ID
  branch_number: string // e.g. "สำนักงานใหญ่" or "00000"
  is_vat_registered: boolean
  default_currency: string
  credit_limit: number
  credit_days: number
  is_active: boolean
  created_at: string
  // Joined
  profiles?: { full_name: string; email: string } | null
}

export interface SalesInvoice {
  id: string
  invoice_number: string
  customer_id: string
  posting_date: string
  due_date: string | null
  docstatus: DocStatus
  order_id: string | null
  subtotal: number
  tax_amount: number
  discount_amount: number
  grand_total: number
  net_total: number // Amount before VAT
  outstanding_amount: number
  paid_amount: number
  status: "Draft" | "Unpaid" | "Paid" | "Overdue" | "Cancelled" | "Return"
  // Thai Tax Invoice fields
  is_tax_invoice: boolean
  tax_invoice_number: string | null
  tax_invoice_date: string | null
  seller_tax_id: string | null
  buyer_tax_id: string | null
  branch_number: string
  vat_included: boolean
  wht_rate: number
  wht_amount: number
  amended_from: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  sales_invoice_items?: SalesInvoiceItem[]
  customers?: Customer
  profiles?: { full_name: string } | null
}

export interface SalesInvoiceItem {
  id: string
  sales_invoice_id: string
  variant_id: string | null
  item_name: string
  description: string | null
  qty: number
  rate: number
  amount: number
  cost_center_id: string | null
}

export interface Quotation {
  id: string
  quotation_number: string
  customer_id: string | null
  posting_date: string
  valid_until: string | null
  docstatus: DocStatus
  subtotal: number
  tax_amount: number
  grand_total: number
  status: "Draft" | "Open" | "Replied" | "Ordered" | "Lost" | "Cancelled"
  amended_from: string | null
  created_by: string | null
  created_at: string
  // Joined
  quotation_items?: QuotationItem[]
  customers?: Customer
  profiles?: { full_name: string } | null
}

export interface QuotationItem {
  id: string
  quotation_id: string
  variant_id: string | null
  item_name: string
  qty: number
  rate: number
  amount: number
}

export interface PricingRule {
  id: string
  name: string
  applicable_for: "Customer" | "Customer Group"
  applicable_value: string | null
  variant_id: string | null
  product_id: string | null
  min_qty: number
  max_qty: number | null
  discount_percentage: number | null
  discount_amount: number | null
  rate: number | null
  priority: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
}

// ======================== STOCK ========================

export interface Warehouse {
  id: string
  name: string
  parent_id: string | null
  is_group: boolean
  address: string | null
  is_active: boolean
  created_at: string
  children?: Warehouse[]
}

export interface StockEntry {
  id: string
  entry_number: string
  entry_type: "Material Receipt" | "Material Issue" | "Material Transfer"
  posting_date: string
  docstatus: DocStatus
  source_warehouse_id: string | null
  target_warehouse_id: string | null
  remarks: string | null
  amended_from: string | null
  created_by: string | null
  created_at: string
  // Joined
  stock_entry_items?: StockEntryItem[]
  profiles?: { full_name: string } | null
  source_warehouse?: Warehouse
  target_warehouse?: Warehouse
}

export interface StockEntryItem {
  id: string
  stock_entry_id: string
  variant_id: string
  qty: number
  valuation_rate: number
  amount: number
  source_warehouse_id: string | null
  target_warehouse_id: string | null
  // Joined
  product_variants?: { sku: string; name: string; products: { name: string } }
}

export interface StockLedgerEntry {
  id: string
  posting_date: string
  variant_id: string
  warehouse_id: string
  qty_change: number
  valuation_rate: number
  qty_after_transaction: number
  voucher_type: string
  voucher_id: string
  is_cancelled: boolean
  created_at: string
  // Joined
  product_variants?: { sku: string; name: string }
  warehouses?: { name: string }
}

// ======================== REPORT TYPES ========================

export interface TrialBalanceRow {
  account_id: string
  account_name: string
  account_number: string | null
  root_type: string
  opening_debit: number
  opening_credit: number
  debit: number
  credit: number
  closing_debit: number
  closing_credit: number
}

export interface GLReportRow {
  posting_date: string
  account_name: string
  account_number: string | null
  debit: number
  credit: number
  balance: number
  voucher_type: string
  voucher_id: string
  remarks: string | null
  party_type: string | null
  party_id: string | null
}

export interface StockBalanceRow {
  variant_id: string
  sku: string
  item_name: string
  warehouse_id: string
  warehouse_name: string
  qty: number
  valuation_rate: number
  value: number
}

// ======================== THAI TAX ========================

export interface WHTCertificate {
  id: string
  certificate_number: string
  certificate_type: "PND3" | "PND53"
  party_type: "Customer" | "Supplier"
  party_id: string
  tax_id_number: string | null
  posting_date: string
  income_type: string
  income_description: string | null
  base_amount: number
  wht_rate: number
  wht_amount: number
  payment_entry_id: string | null
  sales_invoice_id: string | null
  docstatus: DocStatus
  created_by: string | null
  created_at: string
}

// Company settings for Thai tax invoices
export const COMPANY_TAX_INFO = {
  name: "GreenLeaf Organics Co., Ltd.",
  tax_id: "0105564000001",
  branch: "สำนักงานใหญ่",
  address: "123 Green Street, Watthana, Bangkok 10110",
} as const
