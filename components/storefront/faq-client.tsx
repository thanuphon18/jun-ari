"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import type { FaqItem } from "@/lib/cms/types"

interface FaqClientProps {
  items: FaqItem[]
  categories: string[]
}

export function FaqClient({ items, categories }: FaqClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items

  return (
    <div>
      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* FAQ Accordion */}
      <Accordion type="single" collapsible className="w-full">
        {filteredItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left text-foreground hover:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filteredItems.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No questions found in this category.
        </p>
      )}
    </div>
  )
}
