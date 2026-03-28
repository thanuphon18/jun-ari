// ==============================================
// CMS TYPES FOR STOREFRONT
// ==============================================

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  type: "text" | "number" | "boolean" | "json" | "image"
  updated_at: string
}

export interface HeroBanner {
  id: string
  title: string
  subtitle: string | null
  cta_text: string | null
  cta_link: string | null
  image_url: string | null
  background_color: string
  text_color: string
  position: number
  is_active: boolean
  created_at: string
}

export interface ContentPage {
  id: string
  slug: string
  title: string
  content: string | null
  meta_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  position: number
  is_active: boolean
  created_at: string
}

export interface Testimonial {
  id: string
  author_name: string
  author_title: string | null
  content: string
  rating: number
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export interface TrustBadge {
  id: string
  title: string
  description: string | null
  icon_name: string
  position: number
  is_active: boolean
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  position: number
  is_active: boolean
  created_at: string
}

export interface CollectionItem {
  id: string
  collection_id: string
  product_id: string
  position: number
}

export interface NavMenuItem {
  id: string
  label: string
  href: string
  parent_id: string | null
  position: number
  is_active: boolean
  menu_location: "header" | "footer"
  children?: NavMenuItem[]
}

// Site settings keys for type safety
export type SiteSettingKey =
  | "company_name"
  | "tagline"
  | "contact_email"
  | "contact_phone"
  | "address"
  | "free_shipping_threshold"
  | "announcement_text"
  | "facebook_url"
  | "instagram_url"
  | "line_id"
