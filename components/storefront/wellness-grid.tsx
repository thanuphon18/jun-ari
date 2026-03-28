"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const wellnessCategories = [
  {
    title: "Vitamins & Supplements",
    description: "Essential daily nutrition",
    href: "/shop?category=vitamins",
    color: "bg-amber-50",
  },
  {
    title: "Herbal Wellness",
    description: "Natural plant remedies",
    href: "/shop?category=herbal",
    color: "bg-emerald-50",
  },
  {
    title: "Beauty & Skin",
    description: "Radiance from within",
    href: "/shop?category=beauty",
    color: "bg-rose-50",
  },
  {
    title: "Mood & Sleep",
    description: "Rest and relaxation",
    href: "/shop?category=mood",
    color: "bg-indigo-50",
  },
  {
    title: "Digestive Health",
    description: "Gut wellness support",
    href: "/shop?category=digestive",
    color: "bg-orange-50",
  },
  {
    title: "Shop All Products",
    description: "Explore our full collection",
    href: "/shop",
    color: "bg-stone-100",
    isHighlighted: true,
  },
]

export function WellnessGrid() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">Collections</p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            Wellness Essentials for Life
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {wellnessCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                href={category.href}
                className={`block ${category.color} rounded-xl p-6 h-full min-h-[160px] group transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className={`font-semibold text-foreground mb-1 ${category.isHighlighted ? 'text-lg' : 'text-sm'}`}>
                      {category.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
