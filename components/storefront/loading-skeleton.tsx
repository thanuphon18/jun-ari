"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full bg-muted animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-12 w-72 mx-auto" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-background overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-20" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ProductCarouselSkeleton() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <Skeleton className="h-4 w-24 mx-auto mb-3" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrustBadgesSkeleton() {
  return (
    <div className="py-8 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TestimonialSkeleton() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-8 w-56 mx-auto" />
        </div>
        <div className="bg-background p-8 rounded-lg">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 mx-0.5" />
            ))}
          </div>
          <Skeleton className="h-20 w-full mb-6" />
          <div className="flex items-center justify-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function BrandDifferenceSkeleton() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WellnessGridSkeleton() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <Skeleton className="h-4 w-40 mx-auto mb-3" />
          <Skeleton className="h-8 w-56 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  )
}

export function PromoBannerSkeleton() {
  return (
    <div className="relative h-[400px] w-full bg-muted animate-pulse">
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}
