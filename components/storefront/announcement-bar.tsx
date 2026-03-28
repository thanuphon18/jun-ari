"use client"

import { X } from "lucide-react"
import { useState } from "react"

interface AnnouncementBarProps {
  text: string
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || !text) return null

  return (
    <div className="relative bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2.5">
        <p className="text-center text-xs font-medium tracking-widest uppercase">{text}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Close announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
