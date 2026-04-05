import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif)$/i

/**
 * GET /api/gallery
 * Retorna a lista de arquivos de imagem em /public/images/gallery/
 * Usado como fallback para client components se necessário.
 */
export async function GET() {
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'gallery')

  try {
    if (!fs.existsSync(galleryDir)) {
      return NextResponse.json({ images: [], error: 'Pasta não encontrada' })
    }

    const files = fs.readdirSync(galleryDir)
    const images = files
      .filter((file) => IMAGE_EXTENSIONS.test(file))
      .sort() // ordena alfabeticamente — galeria-01 antes de galeria-02
      .map((file) => ({
        fileName: file,
        src: `/images/gallery/${file}`,
        alt: `Galeria Coyotes - ${file.replace(/\.\w+$/, '').replace(/-/g, ' ')}`,
      }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error('[api/gallery] Erro ao ler pasta:', error)
    return NextResponse.json({ images: [], error: 'Erro interno' }, { status: 500 })
  }
}
