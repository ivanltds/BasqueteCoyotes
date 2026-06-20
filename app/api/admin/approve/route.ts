import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

const GALLERY_BASE = 'coyotes/gallery'

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { public_id, target_gallery } = await req.json()

  if (!public_id || !target_gallery) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })
  }

  // Novo public_id: coyotes/gallery/{target}/nome-do-arquivo
  const filename     = public_id.split('/').pop()
  const to_public_id = `${GALLERY_BASE}/${target_gallery}/${filename}`

  // Foto já está no destino correto (aprovação dupla ou rename anterior)
  if (public_id === to_public_id) {
    return NextResponse.json({ ok: true, to_public_id, skipped: true })
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const formBody = new URLSearchParams({
    from_public_id: public_id,
    to_public_id,
    overwrite: 'true',
  })

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/rename`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody.toString(),
  })

  if (!res.ok) {
    const errText = await res.text()

    // "same public_id" = foto já está no destino, tratar como sucesso
    if (res.status === 400 && errText.includes('same public_id')) {
      return NextResponse.json({ ok: true, to_public_id, skipped: true })
    }

    console.error('[Approve] Erro Cloudinary:', res.status, errText)
    return NextResponse.json(
      { error: `Cloudinary: ${res.status} — ${errText}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, to_public_id })
}
