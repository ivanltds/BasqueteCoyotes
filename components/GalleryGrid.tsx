'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CloudinaryImage } from '@/lib/cloudinary'

interface GalleryGridProps {
  images: CloudinaryImage[]
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const INITIAL_COUNT = 20
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, images.length))
  }

  const visibleImages = images.slice(0, visibleCount)
  const hasMore = visibleCount < images.length

  return (
    <div>
      <p className="font-mono text-gray-600 text-xs uppercase tracking-widest mb-6">
        Mostrando {visibleCount} de {images.length} fotos
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
        {visibleImages.map((image, i) => {
          const isWide = i % 7 === 0
          const isTall = i % 11 === 0

          return (
            <div
              key={image.public_id}
              className={[
                'relative overflow-hidden group bg-b-stone aspect-square',
                isWide ? 'col-span-2' : '',
                isTall ? 'row-span-2' : '',
              ].filter(Boolean).join(' ')}
            >
              <Image
                src={image.secure_url}
                alt={image.display_name ?? `Coyotes do Basquetebol — foto ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className={[
                  'object-cover',
                  'grayscale group-hover:grayscale-0',
                  'scale-100 group-hover:scale-110',
                  'transition-all duration-500 ease-out',
                ].join(' ')}
              />
              <div className="absolute inset-0 bg-b-orange/0 group-hover:bg-b-orange/10 transition-colors duration-300" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-b-orange transition-colors duration-300" />
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={showMore}
            className="font-display text-xl uppercase border-2 border-b-neon text-b-neon px-12 py-4 tracking-widest hover:bg-b-neon hover:text-b-dark transition-all duration-200 shadow-neon-yellow"
          >
            Ver Mais Fotos +
          </button>
        </div>
      )}
    </div>
  )
}
