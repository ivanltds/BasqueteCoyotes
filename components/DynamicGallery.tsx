/**
 * DynamicGallery — React Server Component
 *
 * Busca as imagens da pasta configurada no Cloudinary e renderiza o grid.
 * Nenhum código chega ao browser — credenciais 100% seguras.
 *
 * Para adicionar fotos: acesse o painel do Cloudinary, entre na pasta
 * configurada em CLOUDINARY_GALLERY_FOLDER e faça upload. O site
 * atualiza em até 60 segundos (configurável em lib/cloudinary.ts).
 */

import { getCloudinaryImages } from '@/lib/cloudinary'
import GalleryGrid from './GalleryGrid'

const CLOUD_NAME     = process.env.CLOUDINARY_CLOUD_NAME ?? ''
const GALLERY_FOLDER = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'coyotes/gallery'

export default async function DynamicGallery() {
  const images = await getCloudinaryImages(GALLERY_FOLDER, 500)

  if (images.length === 0) {
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
          </a>
          {' '}dentro da pasta{' '}
          <code className="font-mono text-b-neon bg-b-stone px-2 py-0.5">
            {GALLERY_FOLDER}
          </code>
          {' '}e as fotos aparecem aqui automaticamente.
        </p>
        {!CLOUD_NAME && (
          <p className="font-mono text-yellow-600 text-xs mt-4 border border-yellow-900 bg-yellow-950/30 px-4 py-2 inline-block">
            ⚠ CLOUDINARY_CLOUD_NAME não configurado no .env.local
          </p>
        )}
      </div>
    )
  }

  return <GalleryGrid images={images} />
}
