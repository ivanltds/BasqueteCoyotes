import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const allowed: Record<string, unknown> = {}
  const fields = ['title', 'slug', 'excerpt', 'content', 'cover_url', 'cover_public_id', 'published']
  for (const f of fields) {
    if (f in body) allowed[f] = body[f]
  }

  // Se publicando agora, registra published_at
  if (body.published === true) {
    allowed.published_at = new Date().toISOString()
  } else if (body.published === false) {
    allowed.published_at = null
  }

  allowed.updated_at = new Date().toISOString()

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('news')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, news: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('news').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
