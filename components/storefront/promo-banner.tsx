"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface PromoBannerProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  imageUrl?: string
  backgroundColor?: string
  textColor?: string
  imagePosition?: "left" | "right"
}

export function PromoBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageUrl,
  backgroundColor = "#1a1a1a",
  textColor = "#f5f3ef",
  imagePosition = "right",
}: PromoBannerProps) {
  return (
    <section 
      className="relative overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${imagePosition === "left" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center min-h-[400px] lg:min-h-[500px]`}>
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: imagePosition === "left" ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1 py-16 lg:py-20 text-center lg:text-left"
          >
            <p 
              className="text-sm tracking-[0.3em] uppercase mb-4 opacity-70"
              style={{ color: textColor }}
            >
              Featured
            </p>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 leading-tight"
              style={{ color: textColor }}
            >
              {title}
            </h2>
            <p 
              className="text-lg mb-8 opacity-80 max-w-md mx-auto lg:mx-0"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-2 hover:bg-white/10"
              style={{ 
                borderColor: textColor, 
                color: textColor,
              }}
            >
              <Link href={ctaLink}>{ctaText}</Link>
            </Button>
          </motion.div>

          {/* Image */}
          {imageUrl && (
            <motion.div 
              initial={{ opacity: 0, x: imagePosition === "left" ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex-1 relative h-[300px] lg:h-[500px] w-full"
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
