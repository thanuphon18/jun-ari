import { Suspense } from "react"
import { getProducts, getCategories } from "@/lib/queries"
import { ShopClient } from "@/components/storefront/shop-client"

export const metadata = {
  title: "Shop All Products | Jun-Ari",
  description: "Browse our complete collection of premium wellness products. Support you with purity.",
}

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading products...</div>}>
      <ShopClient products={products} categories={categories} />
    </Suspense>
  )
}
