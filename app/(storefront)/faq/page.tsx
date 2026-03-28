import { getFaqItems, getFaqCategories } from "@/lib/cms/queries"
import { FaqClient } from "@/components/storefront/faq-client"

export const metadata = {
  title: "FAQ | Jun-Ari",
  description: "Frequently asked questions about Jun-Ari products and services.",
}

export default async function FaqPage() {
  const [faqItems, categories] = await Promise.all([
    getFaqItems(),
    getFaqCategories(),
  ])

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Support</p>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground font-light">
            Find answers to common questions about our products, shipping, and more.
          </p>
        </div>
        
        <FaqClient items={faqItems} categories={categories} />
      </div>
    </div>
  )
}
