import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — Lista todos os times cadastrados para a área administrativa
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ teams: data ?? [] })
}

// POST — Cadastra uma nova equipe participante
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { 
      name, 
      location, 
      logo_url, 
      logo_public_id, 
      team_photo_url, 
      team_photo_public_id, 
      description_short, 
      description_long 
    } = body

    // Validação de campos obrigatórios
    if (
      !name || 
      !location || 
      !logo_url || 
      !logo_public_id || 
      !team_photo_url || 
      !team_photo_public_id || 
      !description_short || 
      !description_long
    ) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios para o cadastro.' }, { status: 400 })
    }

    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('teams')
      .insert({
        name: name.trim(),
        location: location.trim(),
        logo_url,
        logo_public_id,
        team_photo_url,
        team_photo_public_id,
        description_short: description_short.trim(),
        description_long: description_long.trim(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, team: data })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao cadastrar equipe.' }, { status: 400 })
  }
}
