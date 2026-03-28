"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description?: string | null
    image_url?: string | null
    product_variants?: Array<{
      id: string
      price: number
      compare_at_price?: number | null
    }>
    categories?: { name: string } | null
  }
  showQuickAdd?: boolean
}

export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const { addItem } = useCart()
  
  const variant = product.product_variants?.[0]
  const price = variant?.price ?? 0
  const comparePrice = variant?.compare_at_price
  const hasDiscount = comparePrice && comparePrice > price

  const handleQuickAdd = () => {
    if (!variant) {
      toast.error("Product not available | สินค้าไม่พร้อมจำหน่าย")
      return
    }

    console.log('variant', variant)
    addItem({
      id: variant.id,
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      price: price,
      image_url: product.image_url ?? undefined,
      // quantity: 1,
    })
    toast.success("Added to cart | เพิ่มลงตะกร้าแล้ว")
  }

  return (
    <div className="group relative flex flex-col bg-background overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-warm-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="font-serif text-lg italic">No image</span>
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs tracking-wider">
            Sale | ลดราคา
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 pt-5">
        {product.categories?.name && (
          <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">{product.categories.name}</p>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-serif text-lg text-foreground line-clamp-2 hover:opacity-70 transition-opacity">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-foreground/80 text-foreground/80" />
          ))}
          <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">
              ฿{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ฿{comparePrice.toLocaleString()}
              </span>
            )}
          </div>
          {showQuickAdd && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleQuickAdd} 
              className="shrink-0 hover:bg-foreground hover:text-background transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
