import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — lista imagens de uma notícia (público, usado na página pública)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('news_images')
    .select('id, cloudinary_url, caption, sort_order')
    .eq('news_id', id)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ images: data ?? [] })
}

// POST — adiciona imagem
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const { cloudinary_url, cloudinary_public_id } = await req.json()
  if (!cloudinary_url) return NextResponse.json({ error: 'URL obrigatória.' }, { status: 400 })

  const sb = getSupabaseAdmin()

  // sort_order = max atual + 1
  const { data: existing } = await sb
    .from('news_images')
    .select('sort_order')
    .eq('news_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await sb
    .from('news_images')
    .insert({ news_id: id, cloudinary_url, cloudinary_public_id, sort_order: nextOrder })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, image: data })
}

// PATCH — reordenar (body: { ids: string[] })
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids inválidos.' }, { status: 400 })

  const sb = getSupabaseAdmin()
  await Promise.all(
    ids.map((imgId, order) =>
      sb.from('news_images').update({ sort_order: order }).eq('id', imgId).eq('news_id', id)
    )
  )
  return NextResponse.json({ ok: true })
}
