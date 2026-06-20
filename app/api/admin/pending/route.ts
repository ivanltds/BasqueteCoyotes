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

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      expression: `folder:"${PENDING_FOLDER}"`,
      with_field: ['context', 'tags'],
      max_results: 100,
      sort_by: [{ created_at: 'desc' }],
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erro ao buscar pendentes.' }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ photos: data.resources ?? [] })
}
