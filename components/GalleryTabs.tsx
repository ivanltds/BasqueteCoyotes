'use client'

import { useState } from 'react'
import GalleryGrid from './GalleryGrid'
import { CloudinaryImage } from '@/lib/cloudinary'

interface Gallery {
  id: string
  label: string
  images: CloudinaryImage[]
}

interface GalleryTabsProps {
  galleries: Gallery[]
}

export default function GalleryTabs({ galleries }: GalleryTabsProps) {
  const [active, setActive] = useState(galleries[0]?.id ?? '')

  const current = galleries.find((g) => g.id === active)

  return (
    <div>
      {/* Abas */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-b-stone pb-6">
        {galleries.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`font-display text-lg uppercase px-6 py-2 tracking-widest transition-all duration-200 border-2 ${
              active === g.id
                ? 'bg-b-orange text-b-dark border-b-orange'
                : 'border-b-stone text-gray-400 hover:border-white/40 hover:text-white'
            }`}
          >
            {g.label}
            <span className="ml-2 font-mono text-xs opacity-60">
              {g.images.length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid da aba ativa */}
      {current && current.images.length > 0 ? (
        <GalleryGrid images={current.images} />
      ) : (
        <div className="border-2 border-dashed border-b-stone p-16 text-center">
          <p className="font-display text-3xl text-gray-700 uppercase">
            Nenhuma foto ainda
          </p>
        </div>
      )}
    </div>
  )
}
