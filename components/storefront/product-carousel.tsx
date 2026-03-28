"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"

interface ProductCarouselProps {
  title: string
  subtitle?: string
  products: Array<{
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
  }>
  viewAllLink?: string
}

export function ProductCarousel({ title, subtitle, products, viewAllLink }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 320
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  if (products.length === 0) return null

  return (
    <section className="py-20 md:py-24 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">{subtitle}</p>
            <h2 className="text-3xl md:text-4xl font-light text-foreground">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {viewAllLink && (
              <Button variant="link" asChild className="hidden sm:flex text-foreground p-0 h-auto">
                <Link href={viewAllLink} className="text-sm tracking-wide uppercase">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => scroll("left")}
                className="border-border/50 hover:bg-foreground hover:text-background transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => scroll("right")}
                className="border-border/50 hover:bg-foreground hover:text-background transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[280px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        {viewAllLink && (
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="border-foreground text-foreground hover:bg-foreground hover:text-background tracking-widest uppercase text-xs">
              <Link href={viewAllLink}>
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
