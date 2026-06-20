import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { public_id } = await req.json()

  if (!public_id) {
    return NextResponse.json({ error: 'public_id obrigatório.' }, { status: 400 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const body = new URLSearchParams({ public_id, invalidate: 'true' })

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Reject] Erro Cloudinary:', res.status, err)
    return NextResponse.json({ error: `Cloudinary: ${res.status} — ${err}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
