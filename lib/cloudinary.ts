/**
 * lib/cloudinary.ts
 *
 * Funções para buscar imagens do Cloudinary via API Admin.
 * Este arquivo SÓ é executado no servidor (Server Components / Route Handlers).
 * As credenciais nunca chegam ao browser.
 *
 * ── Como funciona ──────────────────────────────────────────────────────────────
 * 1. Você cria pastas no Cloudinary (ex: coyotes/gallery)
 * 2. O time faz upload direto pelo painel do Cloudinary (sem código)
 * 3. Ao carregar a página, o Next.js chama essas funções no servidor
 * 4. O Cloudinary retorna a lista de imagens com URLs já otimizadas
 * 5. O next/image aplica mais otimização em cima (lazy load, WebP, etc.)
 *
 * ── Transformações automáticas do Cloudinary ──────────────────────────────────
 * - Converte para WebP/AVIF automaticamente
 * - Redimensiona para o tamanho necessário (f_auto, q_auto)
 * - CDN global com cache (~200ms de latência)
 * - Imagens de 5MB viram ~150KB na entrega
 */

export interface CloudinaryImage {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  display_name?: string
}

interface CloudinarySearchResponse {
  resources: CloudinaryImage[]
  next_cursor?: string
  total_count: number
}

/**
 * Busca todas as imagens de uma pasta no Cloudinary.
 */
export async function getCloudinaryImages(
  folder: string,
  maxResults = 50,
  options: { shuffle?: boolean; skipFilter?: boolean } = {}
): Promise<CloudinaryImage[]> {
  const { shuffle = true, skipFilter = false } = options
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey     = process.env.CLOUDINARY_API_KEY
  const apiSecret  = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Cloudinary] Variáveis de ambiente não configuradas.')
    return []
  }

  try {
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

    // Consulta ambas as APIs em paralelo:
    // - Search API  → acha fotos antigas (public_id sem path, folder via asset_folder)
    // - Resources API → acha fotos aprovadas pelo sistema (public_id com path completo)
    const [searchRes, resourcesRes] = await Promise.all([
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression:  `folder:"${folder}"`,
          max_results: maxResults + 5,
          sort_by:     [{ public_id: 'asc' }],
        }),
        next: { revalidate: 15 },
      }),
      fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?` +
          `type=upload&prefix=${encodeURIComponent(folder + '/')}&max_results=${maxResults + 5}`,
        {
          headers: { Authorization: `Basic ${credentials}` },
          next: { revalidate: 15 },
        }
      ),
    ])

    const [searchData, resourcesData] = await Promise.all([
      searchRes.ok  ? searchRes.json()    : Promise.resolve({ resources: [] }),
      resourcesRes.ok ? resourcesRes.json() : Promise.resolve({ resources: [] }),
    ])

    // Mescla e remove duplicatas pelo public_id
    const seen  = new Set<string>()
    let resources: CloudinaryImage[] = []
    for (const r of [...(searchData.resources ?? []), ...(resourcesData.resources ?? [])]) {
      if (!seen.has(r.public_id)) {
        seen.add(r.public_id)
        resources.push(r)
      }
    }

    // FILTRO: Removemos o arquivo do treinador se não pularmos o filtro.
    // Checamos public_id e display_name.
    if (!skipFilter) {
      resources = resources.filter(img => {
        const isTreinador = img.public_id.includes('foto-treinador') || 
                            (img.display_name && img.display_name.includes('foto-treinador'))
        return !isTreinador
      })
    }

    resources = resources.slice(0, maxResults)

    if (shuffle) {
      for (let i = resources.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resources[i], resources[j]] = [resources[j], resources[i]]
      }
    }

    return resources
  } catch (error) {
    console.error('[Cloudinary] Falha ao buscar imagens:', error)
    return []
  }
}

/**
 * Gera uma URL do Cloudinary com transformações otimizadas.
 *
 * @param publicId  - O public_id da imagem (ex: "coyotes/gallery/foto-01")
 * @param width     - Largura máxima desejada em pixels
 * @param quality   - Qualidade (1-100 ou "auto")
 */
export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  options: { width?: number; height?: number; quality?: number | 'auto'; crop?: string } = {}
): string {
  const {
    width   = 800,
    quality = 'auto',
    crop    = 'fill',
  } = options

  const transforms = [
    `f_auto`,               // formato automático (WebP, AVIF, etc.)
    `q_${quality}`,         // qualidade automática ou definida
    `w_${width}`,           // largura máxima
    `c_${crop}`,            // modo de crop
    `dpr_auto`,             // adapta para telas Retina
  ].join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}
