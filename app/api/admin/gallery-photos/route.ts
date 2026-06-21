import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

const GALLERY_BASE = 'coyotes/gallery'

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug obrigatório.' }, { status: 400 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })
  }

  const folder      = `${GALLERY_BASE}/${slug}`
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  // Dual approach: Search API (asset_folder) + Resources API (public_id prefix)
  const [searchRes, resourcesRes] = await Promise.all([
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression:  `folder:"${folder}"`,
        with_field:  ['context', 'tags'],
        max_results: 200,
        sort_by:     [{ created_at: 'desc' }],
      }),
      cache: 'no-store',
    }),
    fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?` +
        `type=upload&prefix=${encodeURIComponent(folder + '/')}&max_results=200`,
      { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' }
    ),
  ])

  const [searchData, resourcesData] = await Promise.all([
    searchRes.ok    ? searchRes.json()    : Promise.resolve({ resources: [] }),
    resourcesRes.ok ? resourcesRes.json() : Promise.resolve({ resources: [] }),
  ])

  // Merge e deduplicar por public_id
  const seen   = new Set<string>()
  const photos: unknown[] = []
  for (const r of [...(searchData.resources ?? []), ...(resourcesData.resources ?? [])]) {
    if (!seen.has(r.public_id)) {
      seen.add(r.public_id)
      photos.push(r)
    }
  }

  return NextResponse.json({ photos })
}
