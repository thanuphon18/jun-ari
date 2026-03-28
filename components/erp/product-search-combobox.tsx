"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatCurrency } from "@/lib/erp/format"

export interface ProductOption {
  id: string
  sku: string
  name: string
  price: number
  product_name: string
  unit: string
}

interface ProductSearchComboboxProps {
  products: ProductOption[]
  value: string | null
  onSelect: (product: ProductOption | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ProductSearchCombobox({
  products,
  value,
  onSelect,
  placeholder = "Search product by SKU or name...",
  disabled = false,
  className,
}: ProductSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selected = products.find(p => p.id === value)

  // Filter products based on search
  const filteredProducts = React.useMemo(() => {
    if (!search) return products.slice(0, 50) // Show first 50 by default
    const term = search.toLowerCase()
    return products.filter(
      p =>
        p.sku.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.product_name.toLowerCase().includes(term)
    ).slice(0, 50)
  }, [products, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span className="font-mono text-xs text-muted-foreground">{selected.sku}</span>
              <span className="truncate">{selected.name || selected.product_name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search SKU or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onSelect(product.id === value ? null : product)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                      <span className="font-medium">{product.name || product.product_name}</span>
                    </div>
                    {product.name && product.product_name && product.name !== product.product_name && (
                      <span className="text-xs text-muted-foreground">{product.product_name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{formatCurrency(product.price)}</span>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
