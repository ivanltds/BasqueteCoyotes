/**
 * DynamicGallery — React Server Component
 *
 * Lê a lista de galerias do Supabase e busca as imagens de cada
 * sub-pasta no Cloudinary em paralelo.
 *
 * Para adicionar uma galeria: acesse /admin/galleries.
 * Para adicionar fotos: clique em "+ Enviar Foto" no site ou faça
 * upload direto no painel do Cloudinary e aprove em /admin.
 */

import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getCloudinaryImages } from '@/lib/cloudinary'
import GalleryTabs from './GalleryTabs'

const GALLERY_BASE = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'coyotes/gallery'

export default async function DynamicGallery() {
  // 1. Busca galerias configuradas
  const sb = getSupabaseAdmin()
  const { data: rows } = await sb
    .from('galleries')
    .select('id, folder_slug, display_name, sort_order')
    .order('sort_order', { ascending: true })

  const galleryDefs = rows ?? []

  // 2. Busca imagens de cada galeria em paralelo
  const images = await Promise.all(
    galleryDefs.map(g => getCloudinaryImages(`${GALLERY_BASE}/${g.folder_slug}`, 500))
  )

  const galleries = galleryDefs.map((g, i) => ({
    id:           g.folder_slug,
    label:        g.display_name,
    images:       images[i],
  }))

  const total = galleries.reduce((s, g) => s + g.images.length, 0)

  if (galleryDefs.length === 0 || total === 0) {
    return (
      <div className="border-2 border-dashed border-b-stone p-16 text-center">
        <p className="font-display text-3xl text-gray-700 uppercase mb-3">Galeria Vazia</p>
        <p className="font-body text-gray-600 text-sm">
          Crie galerias em{' '}
          <span className="font-mono text-b-neon">/admin/galleries</span>{' '}
          e faça upload de fotos pelo botão no site ou pelo painel do Cloudinary.
        </p>
      </div>
    )
  }

  return <GalleryTabs galleries={galleries} />
}
