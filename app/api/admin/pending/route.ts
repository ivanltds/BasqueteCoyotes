import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

const PENDING_FOLDER = 'coyotes/gallery/pendentes'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  // Resources API — sem delay de indexação (diferente da Search API)
  const params = new URLSearchParams({
    type:        'upload',
    prefix:      PENDING_FOLDER + '/',
    context:     'true',
    tags:        'true',
    max_results: '100',
  })

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${params}`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    console.error('[Pending] Erro Cloudinary:', res.status, errText)
    return NextResponse.json({ error: 'Erro ao buscar pendentes.' }, { status: 500 })
  }

  const data = await res.json()

  // Resources API retorna { resources: [...] }, filtrar só o folder exato
  const photos = (data.resources ?? []).filter(
    (r: { public_id: string }) => r.public_id.startsWith(PENDING_FOLDER + '/')
  )

  return NextResponse.json({ photos })
}
