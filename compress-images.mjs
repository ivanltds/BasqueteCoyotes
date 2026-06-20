/**
 * compress-images.mjs
 * Comprime imagens em massa sem perda visível de qualidade.
 *
 * USO:
 *   1. npm install sharp   (só na primeira vez)
 *   2. node compress-images.mjs
 *
 * Resultado: pasta "compressed" criada ao lado da pasta de origem,
 * com as imagens redimensionadas e comprimidas.
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── CONFIGURAÇÕES ──────────────────────────────────────────────────────────────

const SOURCE_FOLDER = 'C:\\Users\\ivanl\\Downloads\\COIOTES-20260620T152207Z-3-002\\COIOTES\\Coiotes Adultos'
const OUTPUT_FOLDER = 'C:\\Users\\ivanl\\Downloads\\COIOTES-20260620T152207Z-3-002\\COIOTES\\Coiotes Adultos - Comprimidas'

const OPTIONS = {
  maxWidth: 2000,      // px — suficiente pra galeria full HD
  maxHeight: 2000,     // px — mantém proporção, nunca estica
  quality: 82,         // 80-85 é o ponto ideal: arquivo ~4x menor, sem diferença visual
  format: 'jpeg',      // converte tudo pra JPEG (inclui .png, .webp)
}

// ──────────────────────────────────────────────────────────────────────────────

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif']

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

async function run() {
  if (!fs.existsSync(SOURCE_FOLDER)) {
    console.error('❌ Pasta de origem não encontrada:', SOURCE_FOLDER)
    process.exit(1)
  }

  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true })

  const files = fs.readdirSync(SOURCE_FOLDER).filter(f =>
    SUPPORTED.includes(path.extname(f).toLowerCase())
  )

  if (files.length === 0) {
    console.log('Nenhuma imagem encontrada na pasta.')
    process.exit(0)
  }

  console.log(`\n🐾 Comprimindo ${files.length} imagens...\n`)

  let totalOriginal = 0
  let totalCompressed = 0

  for (const file of files) {
    const input = path.join(SOURCE_FOLDER, file)
    const outName = path.parse(file).name + '.jpg'
    const output = path.join(OUTPUT_FOLDER, outName)

    const originalSize = fs.statSync(input).size
    totalOriginal += originalSize

    try {
      await sharp(input)
        .rotate()                           // corrige orientação EXIF automaticamente
        .resize({
          width: OPTIONS.maxWidth,
          height: OPTIONS.maxHeight,
          fit: 'inside',                    // nunca estica, só reduz
          withoutEnlargement: true,
        })
        .jpeg({ quality: OPTIONS.quality, mozjpeg: true })
        .toFile(output)

      const compressedSize = fs.statSync(output).size
      totalCompressed += compressedSize
      const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(0)

      console.log(`  ✅ ${file.padEnd(40)} ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (-${reduction}%)`)
    } catch (err) {
      console.error(`  ❌ Erro em ${file}:`, err.message)
    }
  }

  console.log('\n─────────────────────────────────────────────────────')
  console.log(`📦 Total original  : ${formatBytes(totalOriginal)}`)
  console.log(`🗜️  Total comprimido: ${formatBytes(totalCompressed)}`)
  console.log(`🎉 Redução total   : ${(((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(0)}%`)
  console.log(`\n📁 Imagens salvas em:\n   ${OUTPUT_FOLDER}\n`)
}

run()
