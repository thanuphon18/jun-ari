"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, X } from "lucide-react"

interface Product {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  category?: string | null
  product_variants?: Array<{
    id: string
    price: number
    compare_at_price?: number | null
  }>
  categories?: { name: string } | null
}

interface Category {
  id: string
  name: string
}

interface ShopClientProps {
  products: Product[]
  categories: Category[]
}

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc"

export function ShopClient({ products, categories }: ShopClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      console.log('selectedCategories', selectedCategories)
      result = result.filter((p) => p.category && selectedCategories.includes(p.category))
    }

    // Price filter
    result = result.filter((p) => {
      const price = p.product_variants?.[0]?.price ?? 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.product_variants?.[0]?.price ?? 0) - (b.product_variants?.[0]?.price ?? 0))
        break
      case "price-desc":
        result.sort((a, b) => (b.product_variants?.[0]?.price ?? 0) - (a.product_variants?.[0]?.price ?? 0))
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // newest - keep original order
        break
    }

    return result
  }, [products, searchQuery, selectedCategories, sortBy, priceRange])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.includes(categoryId)
      ? prev.filter((id) => id !== categoryId)
      : [...prev, categoryId]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 10000])
  }

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000

  const filterContent = (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={`cat-${category.id}`} className="flex items-center gap-2">
              <Checkbox
                id={`filter-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label htmlFor={`filter-${category.id}`} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0] || ""}
            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
            className="w-24"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1] || ""}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000])}
            className="w-24"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">Our Products</p>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Shop All</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {filterContent}
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              {filterContent}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">No products found</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
