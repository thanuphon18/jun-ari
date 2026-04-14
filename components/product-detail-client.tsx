"use client"

import { useState } from "react"
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import type { ProductWithVariants } from "@/lib/types"
import { formatBahtInteger } from "@/lib/format-baht-display"

export function ProductDetailClient({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [qty, setQty] = useState(1)

  const variant = product.product_variants[selectedVariant]
  if (!variant) return null

  const inv = variant.inventory?.[0]
  const stockStatus = !inv || inv.qty_on_hand === 0
    ? "out-of-stock"
    : inv.qty_on_hand <= inv.reorder_level
      ? "low-stock"
      : "in-stock"

  const stockLabel = stockStatus === "out-of-stock"
    ? "Out of Stock"
    : stockStatus === "low-stock"
      ? "Low Stock"
      : "In Stock"

  const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(variant.price) / Number(variant.compare_at_price)) * 100)
    : 0

  const handleAddToCart = () => {
    addItem(
      {
        id: variant.id,
        variantId: variant.id,
        productId: product.id,
        name: `${product.name} - ${variant.name}`,
        price: Number(variant.price),
        image_url: product.image_url ?? undefined,
      },
      qty
    )
    toast.success(`Added ${qty}x ${product.name} (${variant.name}) to cart`)
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-4">
          <Link href="/shop">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Leaf className="h-32 w-32 text-muted-foreground/20" />
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {/* Category & Rating */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{product.category}</Badge>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">(4.8) 128 reviews</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                ฿{formatBahtInteger(Number(variant.price))}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ฿{formatBahtInteger(Number(variant.compare_at_price))}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                stockStatus === "in-stock" ? "bg-green-500" :
                stockStatus === "low-stock" ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <span className={`text-sm font-medium ${
                stockStatus === "in-stock" ? "text-green-600" :
                stockStatus === "low-stock" ? "text-yellow-600" : "text-red-600"
              }`}>
                {stockLabel}
                {inv && stockStatus === "in-stock" && ` - ${inv.qty_on_hand} available`}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Variant Selector */}
            {product.product_variants.length > 1 && (
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Size / Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map((v, i) => (
                    <Button
                      key={v.id}
                      variant={i === selectedVariant ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setSelectedVariant(i); setQty(1) }}
                      className="min-w-[80px]"
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-center rounded-lg border">
                <Button
                  variant="ghost" size="icon" className="h-12 w-12"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-semibold">{qty}</span>
                <Button
                  variant="ghost" size="icon" className="h-12 w-12"
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={stockStatus === "out-of-stock"}
                size="lg"
                className="flex-1 h-12 text-base font-semibold"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ฿{formatBahtInteger(Number(variant.price) * qty)}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over ฿1,500</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Quality Guaranteed</p>
                  <p className="text-xs text-muted-foreground">Lab tested & certified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="ingredients"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Ingredients
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews (128)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose prose-green max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <h3 className="text-lg font-semibold mt-6 mb-3">Key Benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>100% certified organic ingredients</li>
                  <li>No artificial additives or preservatives</li>
                  <li>Third-party lab tested for purity</li>
                  <li>Sustainably sourced and eco-friendly packaging</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="ingredients" className="pt-6">
              <div className="text-muted-foreground">
                <p className="mb-4">All natural, organic ingredients sourced from certified suppliers.</p>
                <p className="text-sm">
                  For detailed ingredient information, please refer to the product packaging or contact our customer support team.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="space-y-6">
                {/* Sample reviews */}
                {[
                  { name: "Somchai T.", rating: 5, text: "Excellent product! I have been using it for 3 months and noticed significant improvement." },
                  { name: "Natcha P.", rating: 5, text: "High quality and fast delivery. Will definitely order again." },
                  { name: "James W.", rating: 4, text: "Good product, tastes great. Packaging could be better though." },
                ].map((review, i) => (
                  <div key={i} className="border-b pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
