'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export interface SiteMedia {
  id: string
  cloudinary_url: string
  resource_type: string
}

interface Props {
  items: SiteMedia[]
  imageInterval?: number  // ms para imagens (default 6000)
  className?: string
}

/**
 * Slideshow para hero com suporte a imagens e vídeos.
 * - Imagens: avançam após imageInterval ms
 * - Vídeos: rodam completos (onEnded) antes de avançar
 * - 1 item: exibe estático (vídeo em loop)
 */
export default function HeroSlideshow({ items, imageInterval = 6000, className = '' }: Props) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = useCallback(() => {
    if (items.length <= 1) return
    setVisible(false)
    setTimeout(() => {
      setIdx(prev => (prev + 1) % items.length)
      setVisible(true)
    }, 500)
  }, [items.length])

  // Para imagens: timer fixo. Vídeos usam onEnded.
  useEffect(() => {
    if (items.length <= 1) return
    if (items[idx]?.resource_type !== 'video') {
      timerRef.current = setTimeout(advance, imageInterval)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [idx, items, imageInterval, advance])

  if (items.length === 0) return null

  const current = items[idx]
  const isOnly = items.length === 1

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
            loop={isOnly}
            playsInline
            onEnded={isOnly ? undefined : advance}
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
