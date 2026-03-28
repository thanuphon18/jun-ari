/** Format number as Thai Baht currency (default) or other currency */
export function formatCurrency(amount: number | string, currency = "THB"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (currency === "THB") {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/** Format number without currency symbol (for forms/tables) */
export function formatNumber(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/** Format number as quantity */
export function formatQty(qty: number | string): string {
  const num = typeof qty === "string" ? parseFloat(qty) : qty
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

/** Format date for display (Thai locale) */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Format date for tax invoice (DD/MM/YYYY Buddhist Era) */
export function formatThaiTaxDate(date: string): string {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear() + 543 // Buddhist Era
  return `${day}/${month}/${year}`
}

/** Docstatus display label */
export function docStatusLabel(docstatus: number): string {
  switch (docstatus) {
    case 0: return "Draft"
    case 1: return "Submitted"
    case 2: return "Cancelled"
    default: return "Unknown"
  }
}

/** Format Thai Tax ID with dashes: 0-1055-64000-00-1 */
export function formatThaiTaxId(taxId: string | null): string {
  if (!taxId) return "-"
  const clean = taxId.replace(/\D/g, "")
  if (clean.length !== 13) return taxId
  return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`
}

/** Calculate VAT from amount (Thailand 7%) */
export function calculateVat(amount: number, vatIncluded: boolean): { netAmount: number; vatAmount: number } {
  const VAT_RATE = 0.07
  if (vatIncluded) {
    // Amount includes VAT, extract it
    const netAmount = amount / (1 + VAT_RATE)
    const vatAmount = amount - netAmount
    return { netAmount: Math.round(netAmount * 100) / 100, vatAmount: Math.round(vatAmount * 100) / 100 }
  } else {
    // Amount excludes VAT, add it
    const vatAmount = amount * VAT_RATE
    return { netAmount: amount, vatAmount: Math.round(vatAmount * 100) / 100 }
  }
}

/** Calculate WHT (Withholding Tax) */
export function calculateWht(baseAmount: number, whtRate: number): number {
  return Math.round(baseAmount * (whtRate / 100) * 100) / 100
}
