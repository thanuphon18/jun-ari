import { notFound } from "next/navigation"
import { getCollection, getCollectionProducts, getAllCollections } from "@/lib/cms/queries"
import { ProductCard } from "@/components/storefront"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params
  const collection = await getCollection(slug)
  
  if (!collection) {
    return { title: "Collection Not Found" }
  }
  
  return {
    title: `${collection.name} | Jun-Ari`,
    description: collection.description || `Shop our ${collection.name} collection - Support you with purity`,
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params
  const collection = await getCollection(slug)

  if (!collection) {
    notFound()
  }

  const products = await getCollectionProducts(collection.id)

  return (
    <div className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <Button variant="ghost" asChild className="mb-6 -ml-4">
          <Link href="/shop">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Collection</p>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">{collection.name}</h1>
          {collection.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">{collection.description}</p>
          )}
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-4">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/30 rounded-lg">
            <p className="text-muted-foreground mb-4 font-light">No products in this collection yet</p>
            <Button variant="outline" asChild className="tracking-widest uppercase text-xs">
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
