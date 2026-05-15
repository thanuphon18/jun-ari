export function parseFreeShippingThreshold(raw: string | null | undefined): number | null {
  const n = Number.parseFloat(String(raw ?? "").replace(/,/g, "").trim())
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}
