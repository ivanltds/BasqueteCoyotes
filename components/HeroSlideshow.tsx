'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export interface SiteMedia {
  id: string
  cloudinary_url: string
  resource_type: string
}

interface Props {
  items: SiteMedia[]
  interval?: number  // ms entre slides (default 6000)
  className?: string
}

/**
 * Slideshow para hero com suporte a imagens e vídeos.
 * Cicla automaticamente com fade. Se houver 1 item apenas, exibe estático.
 */
export default function HeroSlideshow({ items, interval = 6000, className = '' }: Props) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(prev => (prev + 1) % items.length)
        setVisible(true)
      }, 500) // duração do fade-out
    }, interval)
    return () => clearInterval(timer)
  }, [items.length, interval])

  if (items.length === 0) return null

  const current = items[idx]

  return (
    <div className={`absolute inset-0 ${className}`}>
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {current.resource_type === 'video' ? (
          <video
            key={current.id}
            src={current.cloudinary_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            key={current.id}
            src={current.cloudinary_url}
            alt=""
            fill
            className="object-cover object-center"
            priority={idx === 0}
            quality={90}
          />
        )}
      </div>

      {/* Indicadores de slide (só com 2+ itens) */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); setVisible(true) }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === idx ? 'bg-b-orange w-6' : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
