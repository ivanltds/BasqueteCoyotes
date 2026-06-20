/**
 * DynamicGallery — React Server Component
 *
 * Busca as imagens de cada sub-pasta do Cloudinary em paralelo
 * e renderiza uma galeria com abas (Antigas / Baskferia '25 / Jogos).
 *
 * Para adicionar fotos: acesse o painel do Cloudinary, entre na pasta
 * desejada dentro de coyotes/gallery/ e faça upload. O site atualiza
 * em até 60 segundos.
 */

import { getCloudinaryImages } from '@/lib/cloudinary'
import GalleryTabs from './GalleryTabs'

const BASE = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'coyotes/gallery'

const GALLERIES = [
  { id: 'antigas',     label: 'Antigas',       folder: `${BASE}/antigas` },
  { id: 'baskferia25', label: "Baskferia '25",  folder: `${BASE}/baskferia25` },
  { id: 'jogo',        label: 'Jogos',          folder: `${BASE}/jogo` },
]

export default async function DynamicGallery() {
  const results = await Promise.all(
    GALLERIES.map((g) => getCloudinaryImages(g.folder, 500))
  )

  const galleries = GALLERIES.map((g, i) => ({
    id: g.id,
    label: g.label,
    images: results[i],
  }))

  const total = galleries.reduce((sum, g) => sum + g.images.length, 0)

  if (total === 0) {
    return (
      <div className="border-2 border-dashed border-b-stone p-16 text-center">
        <p className="font-display text-3xl text-gray-700 uppercase mb-3">
          Galeria Vazia
        </p>
        <p className="font-body text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
          Faça upload das fotos no painel do{' '}
          <a
            href="https://cloudinary.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-b-orange underline hover:text-b-neon transition-colors"
          >
            Cloudinary
          </a>{' '}
          dentro das pastas{' '}
          <code className="font-mono text-b-neon bg-b-stone px-2 py-0.5">
            {BASE}/antigas
          </code>
          ,{' '}
          <code className="font-mono text-b-neon bg-b-stone px-2 py-0.5">
            baskferia25
          </code>{' '}
          ou{' '}
          <code className="font-mono text-b-neon bg-b-stone px-2 py-0.5">
            jogo
          </code>
          .
        </p>
      </div>
    )
  }

  return <GalleryTabs galleries={galleries} />
}
