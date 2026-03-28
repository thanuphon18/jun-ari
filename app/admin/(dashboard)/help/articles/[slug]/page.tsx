import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Tag } from "lucide-react"
import { getArticleBySlug, helpCategories, getArticlesByCategory } from "@/lib/help-data"

interface Props {
  params: Promise<{ slug: string }>
}

const moduleColors: Record<string, string> = {
  accounting: "bg-blue-100 text-blue-800",
  selling: "bg-emerald-100 text-emerald-800",
  stock: "bg-amber-100 text-amber-800",
  store: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
}

// Simple markdown-to-HTML converter for our content
function renderContent(content: string): string {
  return content
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-3 text-lg font-semibold text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-4 text-xl font-bold text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mb-6 text-2xl font-bold text-foreground">$1</h1>')
    // Code blocks
    .replace(/```([^`]+)```/gs, '<pre class="my-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">$1</pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm font-mono">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Tables (simple handling)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      if (cells.some(c => c.includes('---'))) {
        return '' // Skip separator row
      }
      const isHeader = cells[0].trim() === cells[0].trim().toUpperCase() || 
                       match.includes('Description') || 
                       match.includes('Account') ||
                       match.includes('Status') ||
                       match.includes('Income Type') ||
                       match.includes('Rate')
      const cellTag = isHeader ? 'th' : 'td'
      const cellClass = isHeader 
        ? 'border border-border bg-muted px-3 py-2 text-left font-medium' 
        : 'border border-border px-3 py-2'
      return `<tr>${cells.map(c => `<${cellTag} class="${cellClass}">${c.trim()}</${cellTag}>`).join('')}</tr>`
    })
    // Wrap table rows
    .replace(/(<tr>.*<\/tr>)+/gs, '<table class="my-4 w-full border-collapse text-sm">$&</table>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    // Paragraphs (lines that aren't already converted)
    .replace(/^(?!<[hpltuc])(.+)$/gm, '<p class="my-3 text-muted-foreground leading-relaxed">$1</p>')
    // Cleanup empty paragraphs
    .replace(/<p class="[^"]*"><\/p>/g, '')
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  
  if (!article) {
    notFound()
  }

  const category = helpCategories.find(c => c.id === article.category)
  const relatedArticles = getArticlesByCategory(article.category)
    .filter(a => a.id !== article.id)
    .slice(0, 3)

  return (
    <div className="grid gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/help" className="hover:text-foreground">Help Center</Link>
        <span>/</span>
        {category && (
          <>
            <Link href={`/admin/help/category/${category.id}`} className="hover:text-foreground">
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{article.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className={moduleColors[article.module]}>{article.module}</Badge>
                    {category && <Badge variant="outline">{category.name}</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{article.title}</h1>
                  <p className="mt-2 text-lg text-muted-foreground">{article.summary}</p>
                </div>
              </div>

              {/* Content */}
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
              />

              {/* Tags */}
              <div className="mt-8 flex items-center gap-2 border-t pt-6">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                {article.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/admin/help">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Help Center
            </Link>
          </Button>

          {relatedArticles.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-3 font-semibold text-foreground">Related Articles</h3>
                <div className="grid gap-2">
                  {relatedArticles.map(related => (
                    <Link
                      key={related.id}
                      href={`/admin/help/articles/${related.slug}`}
                      className="block rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                    >
                      <p className="font-medium text-foreground">{related.title}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
