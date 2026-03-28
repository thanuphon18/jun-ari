import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, FileText, CreditCard, Receipt, ClipboardList, Users, 
  Boxes, Warehouse, ShoppingCart, Package, Search, Rocket, HelpCircle
} from "lucide-react"
import { helpCategories, helpArticles, getArticlesByCategory } from "@/lib/help-data"

const iconMap: Record<string, React.ReactNode> = {
  "rocket": <Rocket className="h-5 w-5" />,
  "book": <BookOpen className="h-5 w-5" />,
  "file-text": <FileText className="h-5 w-5" />,
  "credit-card": <CreditCard className="h-5 w-5" />,
  "receipt": <Receipt className="h-5 w-5" />,
  "clipboard-list": <ClipboardList className="h-5 w-5" />,
  "users": <Users className="h-5 w-5" />,
  "boxes": <Boxes className="h-5 w-5" />,
  "warehouse": <Warehouse className="h-5 w-5" />,
  "shopping-cart": <ShoppingCart className="h-5 w-5" />,
  "package": <Package className="h-5 w-5" />,
}

const moduleColors: Record<string, string> = {
  accounting: "bg-blue-100 text-blue-800",
  selling: "bg-emerald-100 text-emerald-800",
  stock: "bg-amber-100 text-amber-800",
  store: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
}

export default function HelpCenterPage() {
  // Get popular articles
  const popularArticles = helpArticles.slice(0, 5)
  
  // Group categories by module
  const modules = [
    { id: "general", name: "Getting Started", description: "Learn the basics" },
    { id: "accounting", name: "Accounting", description: "Chart of accounts, journal entries, Thai tax" },
    { id: "selling", name: "Selling", description: "Invoices, quotations, customers" },
    { id: "stock", name: "Stock", description: "Inventory, warehouses, stock entries" },
    { id: "store", name: "Store Management", description: "Orders, products, analytics" },
  ]

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground">Documentation and guides for all modules</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Link href="/admin/help/search">
              <Input 
                placeholder="Search articles..." 
                className="pl-10 cursor-pointer"
                readOnly
              />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links - Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5" />
            Popular Articles
          </CardTitle>
          <CardDescription>Most frequently accessed help topics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {popularArticles.map(article => (
              <Link 
                key={article.id}
                href={`/admin/help/articles/${article.slug}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{article.title}</p>
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                </div>
                <Badge className={moduleColors[article.module]}>{article.module}</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories by Module */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map(module => {
          const moduleCategories = helpCategories.filter(c => c.module === module.id)
          if (moduleCategories.length === 0 && module.id !== "general") return null
          
          return (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="text-base">{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {moduleCategories.map(category => {
                    const articleCount = getArticlesByCategory(category.id).length
                    return (
                      <Link
                        key={category.id}
                        href={`/admin/help/category/${category.id}`}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {iconMap[category.icon] || <FileText className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{articleCount} articles</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Thai Tax Quick Links */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Receipt className="h-5 w-5" />
            Thai Tax System
          </CardTitle>
          <CardDescription>Essential guides for Thai tax compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/admin/help/articles/thai-vat-overview"
              className="rounded-lg border bg-background p-4 transition-colors hover:bg-muted"
            >
              <h3 className="font-medium">VAT 7%</h3>
              <p className="text-sm text-muted-foreground">Understanding Thai VAT</p>
            </Link>
            <Link
              href="/admin/help/articles/thai-tax-invoice-requirements"
              className="rounded-lg border bg-background p-4 transition-colors hover:bg-muted"
            >
              <h3 className="font-medium">Tax Invoice</h3>
              <p className="text-sm text-muted-foreground">ใบกำกับภาษี requirements</p>
            </Link>
            <Link
              href="/admin/help/articles/thai-withholding-tax"
              className="rounded-lg border bg-background p-4 transition-colors hover:bg-muted"
            >
              <h3 className="font-medium">Withholding Tax</h3>
              <p className="text-sm text-muted-foreground">หัก ณ ที่จ่าย guide</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
