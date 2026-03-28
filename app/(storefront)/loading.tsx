import {
  HeroSkeleton,
  TrustBadgesSkeleton,
  ProductCarouselSkeleton,
} from "@/components/storefront"

export default function HomeLoading() {
  return (
    <>
      <HeroSkeleton />
      <TrustBadgesSkeleton />
      <ProductCarouselSkeleton />
    </>
  )
}
