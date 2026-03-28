"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { 
  SiteSetting, HeroBanner, ContentPage, FaqItem, 
  Testimonial, TrustBadge, Collection, NavMenuItem 
} from "./types"

type Result = { success: boolean; error?: string }

// ======================== SITE SETTINGS ========================

export async function updateSiteSetting(key: string, value: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("site_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
  
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/settings")
  return { success: true }
}

export async function createSiteSetting(data: { key: string; value: string; type: string }): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("site_settings").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/cms/settings")
  return { success: true }
}

// ======================== HERO BANNERS ========================

export async function createHeroBanner(data: Omit<HeroBanner, "id" | "created_at">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("hero_banners").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/banners")
  return { success: true }
}

export async function updateHeroBanner(id: string, data: Partial<HeroBanner>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("hero_banners").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/banners")
  return { success: true }
}

export async function deleteHeroBanner(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("hero_banners").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/banners")
  return { success: true }
}

// ======================== CONTENT PAGES ========================

export async function createContentPage(data: Omit<ContentPage, "id" | "created_at" | "updated_at">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("content_pages").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/cms/pages")
  revalidatePath(`/${data.slug}`)
  return { success: true }
}

export async function updateContentPage(id: string, data: Partial<ContentPage>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("content_pages")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/cms/pages")
  if (data.slug) revalidatePath(`/${data.slug}`)
  return { success: true }
}

export async function deleteContentPage(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("content_pages").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/cms/pages")
  return { success: true }
}

// ======================== FAQ ITEMS ========================

export async function createFaqItem(data: Omit<FaqItem, "id" | "created_at">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("faq_items").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/faq")
  revalidatePath("/admin/cms/faq")
  return { success: true }
}

export async function updateFaqItem(id: string, data: Partial<FaqItem>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("faq_items").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/faq")
  revalidatePath("/admin/cms/faq")
  return { success: true }
}

export async function deleteFaqItem(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("faq_items").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/faq")
  revalidatePath("/admin/cms/faq")
  return { success: true }
}

// ======================== TESTIMONIALS ========================

export async function createTestimonial(data: Omit<Testimonial, "id" | "created_at">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("testimonials").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/testimonials")
  return { success: true }
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("testimonials").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/testimonials")
  return { success: true }
}

export async function deleteTestimonial(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("testimonials").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/testimonials")
  return { success: true }
}

// ======================== TRUST BADGES ========================

export async function createTrustBadge(data: Omit<TrustBadge, "id">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("trust_badges").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/trust-badges")
  return { success: true }
}

export async function updateTrustBadge(id: string, data: Partial<TrustBadge>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("trust_badges").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/trust-badges")
  return { success: true }
}

export async function deleteTrustBadge(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("trust_badges").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/trust-badges")
  return { success: true }
}

// ======================== COLLECTIONS ========================

export async function createCollection(data: Omit<Collection, "id" | "created_at">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("collections").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/collections")
  return { success: true }
}

export async function updateCollection(id: string, data: Partial<Collection>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("collections").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath(`/collections/${data.slug}`)
  revalidatePath("/admin/cms/collections")
  return { success: true }
}

export async function deleteCollection(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("collections").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/collections")
  return { success: true }
}

export async function addProductToCollection(collectionId: string, productId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("collection_items").insert({
    collection_id: collectionId,
    product_id: productId,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/cms/collections")
  return { success: true }
}

export async function removeProductFromCollection(collectionId: string, productId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("product_id", productId)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/cms/collections")
  return { success: true }
}

// ======================== NAVIGATION ========================

export async function createNavMenuItem(data: Omit<NavMenuItem, "id">): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("nav_menu_items").insert(data)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/navigation")
  return { success: true }
}

export async function updateNavMenuItem(id: string, data: Partial<NavMenuItem>): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("nav_menu_items").update(data).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/navigation")
  return { success: true }
}

export async function deleteNavMenuItem(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("nav_menu_items").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  revalidatePath("/admin/cms/navigation")
  return { success: true }
}
