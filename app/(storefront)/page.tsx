import { Metadata } from "next"
import { getProducts } from "@/lib/queries"
import {
  getSiteSettings,
  getHeroBanners,
  getTrustBadges,
  getCollections,
  getTestimonials,
} from "@/lib/cms/queries"
import {
  HeroCarousel,
  TrustBadgesBar,
  ProductCarousel,
  TestimonialSlider,
  NewsletterSection,
  BrandDifference,
  PromoBanner,
  WellnessGrid,
} from "@/components/storefront"

export const metadata: Metadata = {
  title: "Premium Wellness Products | Jun-Ari Thailand",
  description: "Discover premium wellness products at Jun-Ari. Natural health supplements, holistic wellness solutions, and pure ingredients. Free shipping over ฿2,000 in Thailand. ผลิตภัณฑ์สุขภาพคุณภาพพรีเมียม จุน-อารี",
  keywords: [
    "wellness products Thailand", "health supplements Bangkok", "natural products",
    "ผลิตภัณฑ์สุขภาพ", "อาหารเสริมธรรมชาติ", "จุน-อารี", "สุขภาพองค์รวม"
  ],
  alternates: {
    canonical: "/",
  },
}

export default async function HomePage() {
  const [
    products,
    banners,
    badges,
    collections,
    testimonials,
  ] = await Promise.all([
    getProducts(),
    getHeroBanners(),
    getTrustBadges(),
    getCollections(true),
    getTestimonials(true),
  ])

  const featuredProducts = products.slice(0, 8)
  const newArrivals = products.slice(8, 16)

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel banners={banners} />

      {/* Trust Badges Bar */}
      <TrustBadgesBar badges={badges} />

      {/* Wellness Grid - Shop by Category */}
      <WellnessGrid />

      {/* Best Sellers */}
      <ProductCarousel
        title="Best Sellers"
        subtitle="Essentials we love"
        products={featuredProducts}
        viewAllLink="/shop"
      />

      {/* Promo Banner 1 */}
      <PromoBanner
        title="Ancient Roots for Modern Life"
        subtitle="Trusted for centuries, perfected by science. Discover the power of traditional wellness."
        ctaText="Explore Collection"
        ctaLink="/collections/herbal"
        backgroundColor="#1a1a1a"
        textColor="#f5f3ef"
      />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductCarousel
          title="New Arrivals"
          subtitle="Fresh additions to our collection"
          products={newArrivals}
          viewAllLink="/collections/new-arrivals"
        />
      )}

      {/* Brand Difference Section */}
      <BrandDifference />

      {/* Testimonials */}
      <TestimonialSlider testimonials={testimonials} />

      {/* Second Promo Banner */}
      <PromoBanner
        title="Support You with Purity"
        subtitle="Tools, methods, and ways of living to support your health and wellness journey."
        ctaText="Learn More"
        ctaLink="/about"
        backgroundColor="#f5f3ef"
        textColor="#1a1a1a"
        imagePosition="left"
      />

      {/* Newsletter */}
      <NewsletterSection />
    </>
  )
}
