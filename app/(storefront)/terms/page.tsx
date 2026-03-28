import { notFound } from "next/navigation"
import { getContentPage } from "@/lib/cms/queries"
import ReactMarkdown from "react-markdown"

export async function generateMetadata() {
  const page = await getContentPage("terms")
  return {
    title: page?.title ? `${page.title} | Jun-Ari` : "Terms & Conditions | Jun-Ari",
    description: page?.meta_description || "Our terms and conditions",
  }
}

export default async function TermsPage() {
  const page = await getContentPage("terms")

  if (!page) notFound()

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{page.title}</h1>
        </div>
        
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:font-light prose-p:leading-relaxed">
          <ReactMarkdown>{page.content || ""}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
