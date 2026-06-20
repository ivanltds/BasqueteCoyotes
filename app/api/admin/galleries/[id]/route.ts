import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const GALLERY_BASE = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'coyotes/gallery'

function cloudinaryAuth() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return null
  return { cloudName, credentials: Buffer.from(`${apiKey}:${apiSecret}`).toString('base64') }
}

/** PATCH /api/admin/galleries/[id] — edita display_name (e opcionalmente sort_order) */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (body.display_name !== undefined) updates.display_name = body.display_name.trim()
  if (body.sort_order   !== undefined) updates.sort_order   = body.sort_order

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('galleries').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ gallery: data })
}

/** DELETE /api/admin/galleries/[id] — deleta galeria (bloqueia se tiver fotos) */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data: gallery } = await sb.from('galleries').select('*').eq('id', id).single()
  if (!gallery) return NextResponse.json({ error: 'Galeria não encontrada.' }, { status: 404 })

  // Verifica se tem fotos antes de deletar
  const cloud = cloudinaryAuth()
  if (cloud) {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.cloudName}/resources/search`, {
      method: 'POST',
      headers: { Authorization: `Basic ${cloud.credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: `folder:"${GALLERY_BASE}/${gallery.folder_slug}"`, max_results: 1 }),
      cache: 'no-store',
    })
    const data = await res.json()
    if ((data.total_count ?? 0) > 0) {
      return NextResponse.json(
        { error: `A galeria tem ${data.total_count} foto(s). Remova todas as fotos no Cloudinary antes de deletar.` },
        { status: 409 }
      )
    }

    // Deleta pasta vazia no Cloudinary
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloud.cloudName}/folders/${GALLERY_BASE}/${gallery.folder_slug}`,
      { method: 'DELETE', headers: { Authorization: `Basic ${cloud.credentials}` } }
    )
  }

  const { error } = await sb.from('galleries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
