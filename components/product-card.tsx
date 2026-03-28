"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProductWithVariants } from "@/lib/types"

function getStockInfo(product: ProductWithVariants) {
  const firstVariant = product.product_variants?.[0]
  if (!firstVariant) return { status: "out-of-stock" as const, label: "Out of Stock" }

  const inv = firstVariant.inventory?.[0]
  if (!inv) return { status: "in-stock" as const, label: "In Stock" }

  if (inv.qty_on_hand === 0) return { status: "out-of-stock" as const, label: "Out of Stock" }
  if (inv.qty_on_hand <= inv.reorder_level) return { status: "low-stock" as const, label: "Low Stock" }
  return { status: "in-stock" as const, label: "In Stock" }
}

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const firstVariant = product.product_variants?.[0]
  const { status, label } = getStockInfo(product)
  const price = firstVariant?.price ?? product.base_price

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground/20">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              className={
                status === "in-stock"
                  ? "bg-success text-success-foreground"
                  : status === "low-stock"
                    ? "bg-warning text-warning-foreground"
                    : "bg-destructive text-destructive-foreground"
              }
            >
              {label}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground">{product.category}</p>
          <h3 className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-balance">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-bold text-foreground">${Number(price).toFixed(2)}</span>
          </div>
          {product.product_variants.length > 1 && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              {product.product_variants.length} variants available
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
