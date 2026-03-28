import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Collection } from "@/lib/cms/types"

interface CategoryGridProps {
  collections: Collection[]
  title?: string
  subtitle?: string
}

export function CategoryGrid({ collections, title = "Shop by Collection", subtitle }: CategoryGridProps) {
  if (collections.length === 0) return null

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">Collections</p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative overflow-hidden bg-warm-100 border border-warm-200 hover:border-foreground/20 transition-all duration-300"
            >
              <div className="p-8 md:p-10">
                <h3 className="text-xl font-serif text-foreground mb-2 group-hover:opacity-70 transition-opacity">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <span className="inline-flex items-center text-sm tracking-wider uppercase text-foreground/70 group-hover:text-foreground transition-colors">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
