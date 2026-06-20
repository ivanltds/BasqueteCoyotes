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

import { getSupabasePublic } from '@/lib/supabase-server'
import { getCloudinaryImages } from '@/lib/cloudinary'
import GalleryTabs from './GalleryTabs'

const GALLERY_BASE = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'coyotes/gallery'

export default async function DynamicGallery() {
  // 1. Busca galerias configuradas (anon key — dados públicos)
  const sb = getSupabasePublic()
  const { data: rows, error } = await sb
    .from('galleries')
    .select('id, folder_slug, display_name, sort_order')
    .order('sort_order', { ascending: true })

  if (error) console.error('[DynamicGallery] Supabase error:', error.message)

  const galleryDefs = rows ?? []

  // Sem galerias cadastradas → instrução de setup
  if (galleryDefs.length === 0) {
    return (
      <div className="border-2 border-dashed border-b-stone p-16 text-center">
        <p className="font-display text-3xl text-gray-700 uppercase mb-3">Nenhuma galeria criada</p>
        <p className="font-body text-gray-600 text-sm">
          Acesse <span className="font-mono text-b-neon">/admin/galleries</span> para criar as galerias.
        </p>
      </div>
    )
  }

  // 2. Busca imagens de cada galeria em paralelo
  const images = await Promise.all(
    galleryDefs.map(g => getCloudinaryImages(`${GALLERY_BASE}/${g.folder_slug}`, 500))
  )

  const galleries = galleryDefs.map((g, i) => ({
    id:     g.folder_slug,
    label:  g.display_name,
    images: images[i],
  }))

  // Mostra as abas mesmo que as fotos estejam vazias
  return <GalleryTabs galleries={galleries} />
}
