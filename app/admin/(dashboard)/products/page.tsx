import { getAllProducts, getCategories } from "@/lib/queries"
import { AdminProductsClient } from "@/components/admin/products-client"

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ])

  return <AdminProductsClient products={products} categories={categories} />
}
