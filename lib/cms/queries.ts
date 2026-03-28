import { createClient } from "@/lib/supabase/server"

import type {
  SiteSetting,
  HeroBanner,
  ContentPage,
  FaqItem,
  Testimonial,
  TrustBadge,
  Collection,
  NavMenuItem,
  SiteSettingKey,
} from "./types"

// ==============================================
// SITE SETTINGS
// ==============================================

export async function getSiteSettings(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
  
  const settings: Record<string, string> = {}
  data?.forEach(s => {
    if (s.value) settings[s.key] = s.value
  })
  return settings
}

export async function getSiteSetting(key: SiteSettingKey): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single()
  return data?.value ?? null
}

export async function getAnnouncementText(): Promise<string> {
  const text = await getSiteSetting("announcement_text")
  return text || ""
}

// ==============================================
// HERO BANNERS
// ==============================================

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("position")
  return (data ?? []) as HeroBanner[]
}

export async function getAllHeroBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hero_banners")
    .select("*")
    .order("position")
  return (data ?? []) as HeroBanner[]
}

// ==============================================
// CONTENT PAGES
// ==============================================

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content_pages")
    .select("*")
    .eq("slug", slug)
    .single()
  return data as ContentPage | null
}

export async function getAllContentPages(): Promise<ContentPage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content_pages")
    .select("*")
    .order("title")
  return (data ?? []) as ContentPage[]
}

// ==============================================
// FAQ
// ==============================================

export async function getFaqItems(): Promise<FaqItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("faq_items")
    .select("*")
    .eq("is_active", true)
    .order("position")
  return (data ?? []) as FaqItem[]
}

export async function getAllFaqItems(): Promise<FaqItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("faq_items")
    .select("*")
    .order("position")
  return (data ?? []) as FaqItem[]
}

export async function getFaqCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("faq_items")
    .select("category")
    .eq("is_active", true)
  
  const categories = [...new Set(data?.map(f => f.category) ?? [])]
  return categories
}

// ==============================================
// TESTIMONIALS
// ==============================================

export async function getTestimonials(featuredOnly = false): Promise<Testimonial[]> {
  const supabase = await createClient()
  let query = supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
  
  if (featuredOnly) {
    query = query.eq("is_featured", true)
  }
  
  const { data } = await query.order("created_at", { ascending: false })
  return (data ?? []) as Testimonial[]
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as Testimonial[]
}

// ==============================================
// TRUST BADGES
// ==============================================

export async function getTrustBadges(): Promise<TrustBadge[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("trust_badges")
    .select("*")
    .eq("is_active", true)
    .order("position")
  return (data ?? []) as TrustBadge[]
}

export async function getAllTrustBadges(): Promise<TrustBadge[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("trust_badges")
    .select("*")
    .order("position")
  return (data ?? []) as TrustBadge[]
}

// ==============================================
// COLLECTIONS
// ==============================================

export async function getCollections(featuredOnly = false): Promise<Collection[]> {
  const supabase = await createClient()
  let query = supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
  
  if (featuredOnly) {
    query = query.eq("is_featured", true)
  }
  
  const { data } = await query.order("position")
  return (data ?? []) as Collection[]
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single()
  return data as Collection | null
}

export async function getAllCollections(): Promise<Collection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("position")
  return (data ?? []) as Collection[]
}

export async function getCollectionProducts(collectionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("collection_items")
    .select("position, products(*, product_variants(*), categories(name))")
    .eq("collection_id", collectionId)
    .order("position")
  
  return data?.map(item => ({
    ...item.products,
    position: item.position
  })) ?? []
}

// ==============================================
// NAVIGATION
// ==============================================

export async function getNavMenuItems(location: "header" | "footer"): Promise<NavMenuItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("nav_menu_items")
    .select("*")
    .eq("menu_location", location)
    .eq("is_active", true)
    .order("position")
  
  // Build tree structure for nested menus
  const items = (data ?? []) as NavMenuItem[]
  const rootItems = items.filter(i => !i.parent_id)
  
  rootItems.forEach(root => {
    root.children = items.filter(i => i.parent_id === root.id)
  })
  
  return rootItems
}

export async function getAllNavMenuItems(): Promise<NavMenuItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("nav_menu_items")
    .select("*")
    .order("menu_location")
    .order("position")
  return (data ?? []) as NavMenuItem[]
}
