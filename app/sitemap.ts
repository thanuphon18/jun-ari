import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jun-ari.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  
  // Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
  
  // Fetch all collections
  const { data: collections } = await supabase
    .from('collections')
    .select('slug, updated_at')
    .eq('is_active', true)
  
  // Fetch all content pages
  const { data: pages } = await supabase
    .from('content_pages')
    .select('slug, updated_at')
    .eq('is_published', true)

  // Static pages - Thai and English versions
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/shop', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/loyalty', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/subscribe', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/shipping', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        'en': `${BASE_URL}/en${page.url}`,
        'th': `${BASE_URL}/th${page.url}`,
      },
    },
  }))

  // Product pages
  const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: {
        'en': `${BASE_URL}/en/products/${product.slug}`,
        'th': `${BASE_URL}/th/products/${product.slug}`,
      },
    },
  }))

  // Collection pages
  const collectionEntries: MetadataRoute.Sitemap = (collections || []).map((collection) => ({
    url: `${BASE_URL}/collections/${collection.slug}`,
    lastModified: collection.updated_at ? new Date(collection.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        'en': `${BASE_URL}/en/collections/${collection.slug}`,
        'th': `${BASE_URL}/th/collections/${collection.slug}`,
      },
    },
  }))

  // Content pages
  const contentEntries: MetadataRoute.Sitemap = (pages || []).map((page) => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...productEntries, ...collectionEntries, ...contentEntries]
}
