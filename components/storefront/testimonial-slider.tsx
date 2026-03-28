"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import type { Testimonial } from "@/lib/cms/types"

interface TestimonialSliderProps {
  testimonials: Testimonial[]
}

export function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length, nextSlide])

  if (testimonials.length === 0) return null

  const current = testimonials[currentIndex]

  return (
    <section className="py-20 px-4 bg-warm-100">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            Words from Our Community
          </h2>
        </div>

        <div className="relative">
          <div className="text-center px-8 md:px-16">
            {/* Quote mark */}
            <div className="mb-8">
              <span className="font-serif text-6xl text-foreground/20">"</span>
            </div>
            
            <p className="text-xl md:text-2xl font-serif text-foreground/90 mb-8 leading-relaxed italic">
              {current.content}
            </p>

            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1 mb-3">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                ))}
              </div>
              <p className="font-medium text-foreground tracking-wide">{current.author_name}</p>
              {current.author_title && (
                <p className="text-sm text-muted-foreground">{current.author_title}</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:opacity-60 transition-opacity"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:opacity-60 transition-opacity"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-foreground" : "w-1.5 bg-foreground/30"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
