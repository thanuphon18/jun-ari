import { notFound } from "next/navigation"
import { getContentPage } from "@/lib/cms/queries"
import ReactMarkdown from "react-markdown"

export async function generateMetadata() {
  const page = await getContentPage("shipping")
  return {
    title: page?.title ? `${page.title} | Jun-Ari` : "Shipping & Returns | Jun-Ari",
    description: page?.meta_description || "Shipping information and return policy",
  }
}

export default async function ShippingPage() {
  const page = await getContentPage("shipping")

  if (!page) notFound()

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Support</p>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{page.title}</h1>
        </div>
        
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:font-light prose-p:leading-relaxed">
          <ReactMarkdown>{page.content || ""}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
