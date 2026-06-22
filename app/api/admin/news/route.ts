import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase-server'

// GET — lista TODAS as notícias (admin, incluindo rascunhos)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('news')
    .select('id, title, slug, excerpt, cover_url, published, published_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ news: data ?? [] })
}

// POST — criar notícia
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const body = await req.json()
  const { title, slug, excerpt, content, cover_url, cover_public_id, published } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Título e slug são obrigatórios.' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('news')
    .insert({
      title,
      slug,
      excerpt: excerpt ?? null,
      content: content ?? '',
      cover_url: cover_url ?? null,
      cover_public_id: cover_public_id ?? null,
      published: published ?? false,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, news: data })
}
