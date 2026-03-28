"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoreHeader } from "@/components/store-header"
import { ProductCard } from "@/components/product-card"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ProductWithVariants } from "@/lib/types"

interface HomeClientProps {
  products: ProductWithVariants[]
  categories: string[]
}

export function HomeClient({ products, categories }: HomeClientProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const { isAuthenticated } = useAuth()

  const filtered = products
    .filter(p => category === "All" || p.category === category)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 rounded-xl bg-primary p-8 text-primary-foreground md:p-12">
          <h1 className="text-2xl font-bold md:text-4xl text-balance">
            Premium Health & Wellness
          </h1>
          <p className="mt-2 max-w-lg text-sm opacity-90 leading-relaxed md:text-base">
            Discover our curated collection of skincare, supplements, and wellness products.
          </p>
          {!isAuthenticated && (
            <Button asChild className="mt-4 bg-card text-foreground hover:bg-card/90" size="sm">
              <Link href="/login">Sign in to your account</Link>
            </Button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              {categories.map(c => (
                <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No products found matching your search.
          </div>
        )}
      </main>
    </div>
  )
}
