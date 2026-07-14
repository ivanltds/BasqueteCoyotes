import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — Lista todos os representantes para a área administrativa com o time associado
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('representatives')
    .select('*, teams(name)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ representatives: data ?? [] })
}

// POST — Cadastra um novo representante de equipe
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { 
      name, 
      team_id, 
      modality, 
      photo_url, 
      photo_public_id, 
      link 
    } = body

    // Validação de campos obrigatórios
    if (!name || !team_id || !modality || !photo_url || !photo_public_id) {
      return NextResponse.json({ error: 'Nome, equipe, modalidade e foto são obrigatórios.' }, { status: 400 })
    }

    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('representatives')
      .insert({
        name: name.trim(),
        team_id,
        modality,
        photo_url,
        photo_public_id,
        link: link?.trim() || null
      })
      .select('*, teams(name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, representative: data })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao cadastrar representante.' }, { status: 400 })
  }
}
