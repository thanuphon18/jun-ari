"use client"

import { Heart, Beaker, Leaf, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

const differencePoints = [
  {
    icon: Heart,
    title: { en: "Empowering Purpose", th: "เสริมพลังเป้าหมาย" },
    description: { 
      en: "Our goal is to help you reach yours.", 
      th: "เป้าหมายของเราคือช่วยให้คุณบรรลุเป้าหมาย" 
    },
  },
  {
    icon: Beaker,
    title: { en: "Science-Driven Wellness", th: "สุขภาพจากหลักวิทยาศาสตร์" },
    description: { 
      en: "Backed by research, perfected by nature.", 
      th: "รองรับด้วยงานวิจัย สมบูรณ์แบบจากธรรมชาติ" 
    },
  },
  {
    icon: Leaf,
    title: { en: "Purity Without Compromise", th: "ความบริสุทธิ์ไม่ประนีประนอม" },
    description: { 
      en: "We only source the best, so you can feel your best.", 
      th: "เราคัดสรรสิ่งที่ดีที่สุด เพื่อให้คุณรู้สึกดีที่สุด" 
    },
  },
  {
    icon: ShieldCheck,
    title: { en: "A Trustworthy Approach", th: "แนวทางที่ไว้วางใจได้" },
    description: { 
      en: "Always tested, forever trusted.", 
      th: "ผ่านการทดสอบเสมอ ไว้วางใจได้ตลอดไป" 
    },
  },
]

export function BrandDifference() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">
            Why Choose Us | ทำไมต้องเลือกเรา
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            The Jun-Ari Difference
          </h2>
          <p className="text-muted-foreground mt-2 font-sans text-sm">
            ความแตกต่างของ จุน-อารี
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differencePoints.map((point, index) => (
            <motion.div
              key={point.title.en}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <point.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {point.title.en}
              </h3>
              <p className="text-sm text-primary/70 mb-3 font-sans">
                {point.title.th}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {point.description.en}
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1 font-sans">
                {point.description.th}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
