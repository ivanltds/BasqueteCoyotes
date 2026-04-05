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
 * Retorna no máximo `maxResults` imagens (padrão: 50).
 */
export async function getCloudinaryImages(
  folder: string,
  maxResults = 50
): Promise<CloudinaryImage[]> {
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey     = process.env.CLOUDINARY_API_KEY
  const apiSecret  = process.env.CLOUDINARY_API_SECRET

  // Se as variáveis não estiverem configuradas, retorna vazio (não quebra o build)
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      '[Cloudinary] Variáveis de ambiente não configuradas. ' +
      'Adicione CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no .env.local'
    )
    return []
  }

  try {
    // Cloudinary Admin API — Search endpoint
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`

    // Autenticação Basic (API Key:API Secret em base64)
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

    const body = JSON.stringify({
      expression: `folder:${folder}`,  // busca só dentro da pasta configurada
      max_results: maxResults,
      sort_by: [{ public_id: 'asc' }], // ordena pelo nome do arquivo
      with_field: [], // display_name não é suportado aqui pelo Search API
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body,
      // Revalida a cada 60 segundos em produção — zero custo de API
      // Para atualização instantânea, mude para: { cache: 'no-store' }
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Cloudinary] Erro na API:', res.status, err)
      return []
    }

    const data: CloudinarySearchResponse = await res.json()
    const resources = data.resources ?? []

    // Embaralha os resultados (Fisher-Yates) para evitar fotos sequenciais semelhantes
    for (let i = resources.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resources[i], resources[j]] = [resources[j], resources[i]]
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
