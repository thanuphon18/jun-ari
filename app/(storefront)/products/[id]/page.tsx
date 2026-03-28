import { getProductBySlug, getProductById, getProducts } from "@/lib/queries"
import { getTrustBadges } from "@/lib/cms/queries"
import { ProductDetailClient } from "@/components/product-detail-client"
import { TrustBadgesBar, ProductCarousel } from "@/components/storefront"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

async function getProduct(idOrSlug: string) {
  // Try to find by slug first, then by ID
  let product = await getProductBySlug(idOrSlug)
  if (!product) {
    product = await getProductById(idOrSlug)
  }
  return product
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  
  if (!product) {
    return { title: "Product Not Found" }
  }
  
  return {
    title: `${product.name} | Jun-Ari`,
    description: product.description || `Shop ${product.name} - Support you with purity`,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, badges, allProducts] = await Promise.all([
    getProduct(id),
    getTrustBadges(),
    getProducts(),
  ])

  if (!product) notFound()

  // Get related products (same category, excluding current)
  const relatedProducts = allProducts
    .filter(p => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 6)

  return (
    <>
      <ProductDetailClient product={product} />
      
      {/* Trust Badges */}
      <TrustBadgesBar badges={badges} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductCarousel
          title="You May Also Like"
          subtitle="Similar products you might enjoy"
          products={relatedProducts}
          viewAllLink="/shop"
        />
      )}
    </>
  )
}
