/**
 * Integer ฿ amounts shown in storefront UI (prefix ฿ in JSX).
 * Uses a fixed locale so SSR (Node) and the browser produce the same string and avoid hydration mismatches.
 */
const bahtIntegerFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatBahtInteger(amount: number): string {
  return bahtIntegerFormat.format(amount)
}
