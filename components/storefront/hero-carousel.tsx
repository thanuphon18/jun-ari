"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HeroBanner } from "@/lib/cms/types"

interface HeroCarouselProps {
  banners: HeroBanner[]
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [banners.length, nextSlide])

  if (banners.length === 0) {
    return (
      <section className="relative bg-secondary py-28 md:py-36 lg:py-44 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Support You with Purity</p>
          <p className="text-xs tracking-[0.2em] text-muted-foreground/70 mb-6 font-sans">สนับสนุนคุณด้วยความบริสุทธิ์</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4 text-balance leading-tight">
            Potential Products from Earth&apos;s Creation
          </h1>
          <p className="text-lg text-primary/70 mb-6 font-sans">ผลิตภัณฑ์จากธรรมชาติเพื่อสุขภาพที่ดี</p>
          <p className="text-base text-muted-foreground mb-10 text-pretty max-w-xl mx-auto font-light">
            We believe in the holistic development of every individual through pure, natural wellness.
          </p>
          <Button size="lg" variant="outline" asChild className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-all tracking-widest uppercase text-xs px-8 py-6">
            <Link href="/shop">Shop Now | ช้อปเลย</Link>
          </Button>
        </div>
      </section>
    )
  }

  const current = banners[currentIndex]
  const hasImage = !!current.image_url

  return (
    <section className="relative overflow-hidden">
      <div
        className="relative py-28 md:py-36 lg:py-44 px-4 transition-all duration-700"
        style={{ backgroundColor: current.background_color }}
      >
        {/* Background Image (if available) */}
        {hasImage && (
          <>
            <Image
              src={current.image_url!}
              alt=""
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="100vw"
            />
            {/* Overlay for readability */}
            <div 
              className="absolute inset-0 transition-opacity duration-700"
              style={{ backgroundColor: current.background_color, opacity: 0.6 }}
            />
          </>
        )}

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-6 opacity-70"
            style={{ color: current.text_color }}
          >
            Support You with Purity
          </p>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-6 text-balance leading-tight"
            style={{ color: current.text_color }}
          >
            {current.title}
          </h1>
          {current.subtitle && (
            <p
              className="text-base md:text-lg mb-10 text-pretty max-w-xl mx-auto font-light opacity-80"
              style={{ color: current.text_color }}
            >
              {current.subtitle}
            </p>
          )}
          {current.cta_text && current.cta_link && (
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="border-current text-current hover:bg-white/10 transition-all tracking-widest uppercase text-xs px-8 py-6"
              style={{ borderColor: current.text_color, color: current.text_color }}
            >
              <Link href={current.cta_link}>{current.cta_text}</Link>
            </Button>
          )}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 hover:opacity-70 transition-opacity z-20"
              style={{ color: current.text_color }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 hover:opacity-70 transition-opacity z-20"
              style={{ color: current.text_color }}
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-current" : "w-1.5 bg-current opacity-40"
                }`}
                style={{ color: current.text_color }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
