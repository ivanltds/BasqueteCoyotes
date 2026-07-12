import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — Lista todos os apoiadores (com cliques) para a área administrativa
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('supporters')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ supporters: data ?? [] })
}

// POST — Cadastra um novo apoiador
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, photo_url, photo_public_id, link } = body

    if (!name || !photo_url || !link) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes: name, photo_url ou link.' }, { status: 400 })
    }

    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('supporters')
      .insert({
        name,
        photo_url,
        photo_public_id: photo_public_id ?? null,
        link,
        clicks_count: 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, supporter: data })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao processar requisição.' }, { status: 400 })
  }
}
